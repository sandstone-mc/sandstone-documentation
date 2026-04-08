import React, { useCallback, useEffect, useRef, useState } from 'react'
import { usePluginData } from '@docusaurus/useGlobalData'
import { Editor, EditorHandle } from './Editor'
import { CustomHandlerFileObject, compileDataPack } from '../utils/compiler'
import { CodeOutput } from './CodeOutput'
import { debounce } from 'lodash'
import { useMonacoRecovery } from './MonacoRecoveryContext'

// Boilerplate resources to hide (matches CLI filtering)
const BOILERPLATE_NAMESPACES = new Set(['load', '__sandstone__'])
const BOILERPLATE_FUNCTIONS = new Set(['__init__'])
const BOILERPLATE_TAG = { namespace: 'minecraft', name: 'load' }

// Parse code once and return normalized code + detected sandstone exports
// Normalized code strips comments and normalizes whitespace for change detection
async function analyzeCode(code: string, allExports: string[]): Promise<{ normalized: string; usedExports: string[] }> {
  if (typeof window === 'undefined') {
    return { normalized: code.trim(), usedExports: [] }
  }

  try {
    const ts = await import('typescript')
    const exportSet = new Set(allExports)
    const used = new Set<string>()

    const sourceFile = ts.createSourceFile('temp.ts', code, ts.ScriptTarget.Latest, true)

    // Get normalized code (strips comments and normalizes whitespace)
    const printer = ts.createPrinter({ removeComments: true })
    const normalized = printer.printFile(sourceFile)

    // Find used sandstone exports
    function visit(node: unknown, parent: unknown) {
      if (ts.isIdentifier(node as Parameters<typeof ts.isIdentifier>[0])) {
        const name = (node as { text: string }).text

        // Skip if this identifier is the property name in a property access (e.g., .say, .run)
        // We only want top-level references, not method calls
        if (parent && ts.isPropertyAccessExpression(parent as Parameters<typeof ts.isPropertyAccessExpression>[0])) {
          const propAccess = parent as { name: unknown }
          if (propAccess.name === node) {
            ts.forEachChild(node as Parameters<typeof ts.forEachChild>[0], (child) => visit(child, node))
            return
          }
        }

        if (exportSet.has(name)) {
          used.add(name)
        }
      }
      ts.forEachChild(node as Parameters<typeof ts.forEachChild>[0], (child) => visit(child, node))
    }

    visit(sourceFile, null)

    return { normalized, usedExports: Array.from(used) }
  } catch {
    // If parsing fails, fall back to trimmed raw code
    return { normalized: code.trim(), usedExports: [] }
  }
}

function isBoilerplateFile(relativePath: string): boolean {
  // Path format: datapack/data/namespace/functions/name.mcfunction
  // or: datapack/data/namespace/tags/function/name.json
  const parts = relativePath.split('/')
  if (parts.length < 4) return false

  const namespace = parts[2]
  const fileName = parts[parts.length - 1].replace(/\.[^.]+$/, '') // Remove extension

  // Exclude load and __sandstone__ namespaces
  if (BOILERPLATE_NAMESPACES.has(namespace)) return true

  // Exclude __init__ functions
  if (BOILERPLATE_FUNCTIONS.has(fileName)) return true

  // Exclude minecraft:load tag
  if (namespace === BOILERPLATE_TAG.namespace &&
      relativePath.includes('/tags/') &&
      fileName === BOILERPLATE_TAG.name) return true

  return false
}

const StatusIndicator = ({ status }: { status: 'loading' | 'pending' }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    margin: '10px auto',
    border: '2px solid rgb(30, 30, 30)',
    borderRadius: 5,
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor: 'rgb(30, 30, 30)',
    color: '#888',
  }}>
    <style>{`
      @keyframes pulse {
        0%, 80%, 100% { opacity: 0.3; }
        40% { opacity: 1; }
      }
      .loading-dot {
        animation: pulse 1.4s ease-in-out infinite;
      }
      .loading-dot:nth-child(2) { animation-delay: 0.2s; }
      .loading-dot:nth-child(3) { animation-delay: 0.4s; }
    `}</style>
    <span style={{ marginRight: 8 }}>{status === 'loading' ? 'Compiling' : 'Waiting to compile'}</span>
    <span className="loading-dot">.</span>
    <span className="loading-dot">.</span>
    <span className="loading-dot">.</span>
  </div>
)

export type InteractiveSnippetProps = {
  height: number
  code?: string
  encodedCode?: string
  filename?: string
  baseImports?: string[]
  children?: string
  rawCode: string
}

// Client-only component with all the interactive functionality
export const InteractiveSnippetClient = (props: InteractiveSnippetProps) => {
  const { rawCode } = props
  const { resetKey } = useMonacoRecovery()
  const { sandstoneFiles, sandstoneExports } = usePluginData('get-sandstone-files') as {
    sandstoneFiles: [content: string, fileName: string][],
    sandstoneExports: string[]
  }
  const [compiledDataPack, setCompiledDataPack] = useState<CustomHandlerFileObject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasBeenVisible, setHasBeenVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<EditorHandle>(null)
  const lastBuildTime = useRef<number>(0)
  const rateLimitTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstCompile = useRef(true)

  // Track visibility with IntersectionObserver
  // Re-runs when resetKey changes to re-detect visibility after recovery
  useEffect(() => {
    if (!containerRef.current) return

    // Reset visibility state when resetKey changes (recovery triggered)
    if (resetKey > 0) {
      setHasBeenVisible(false)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasBeenVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [resetKey])

  // Editor shows code without imports (types are globally available)
  const [editorValue, setEditorValue] = useState(() => rawCode.trim())

  const [previousCode, setPreviousCode] = useState('')

  // Track whether the last compile had TS errors (to force recompile when errors clear)
  const [hadTsErrors, setHadTsErrors] = useState(false)

  const doCompile = useCallback(async (code: string) => {

    // Skip TS check on first compile - assume docs code is error-free
    // Parse code once to get normalized version and detect used exports
    const { normalized, usedExports } = await analyzeCode(code, sandstoneExports || [])

    let errors: Awaited<ReturnType<EditorHandle['getTypeScriptDiagnostics']>> = []
    let hasTsErrors = false

    if (isFirstCompile.current) {
      isFirstCompile.current = false
    } else {
      // Wait for TypeScript to finish analyzing and get fresh diagnostics
      errors = await editorRef.current?.getTypeScriptDiagnostics() ?? []
      hasTsErrors = errors.some(error => error.owner === 'typescript' && error.severity > 1)
    }

    // Skip if normalized code unchanged AND error state unchanged
    if (previousCode === normalized && hadTsErrors === hasTsErrors) {
      return
    }

    setIsLoading(true)
    lastBuildTime.current = Date.now()

    if (hasTsErrors) {
      setPreviousCode(normalized) // Track normalized code so we don't re-process it
      setHadTsErrors(true)
      const tsErrors = errors.filter(e => e.owner === 'typescript' && e.severity > 1)
      const errorContent = tsErrors
        .map(e => `Line ${e.startLineNumber}: ${e.message}`)
        .join('\n')
      setCompiledDataPack([{ type: 'errors', relativePath: '', key: 0, content: errorContent }])
      setIsLoading(false)
      return
    }

    // No TS errors, clear the flag
    setHadTsErrors(false)

    // Generate import statement from detected exports
    const importStatement = usedExports.length > 0
      ? `import { ${usedExports.join(', ')} } from 'sandstone'\n\n`
      : ''
    const codeWithImports = importStatement + code

    compileDataPack(codeWithImports)
      .then(({ result }) => {
        setPreviousCode(normalized)
        setCompiledDataPack(Object.entries(result)
          .filter(([relativePath]) => !isBoilerplateFile(relativePath))
          .map(([relativePath, content], key) => {
            // Pretty-print JSON files for better readability
            let formattedContent = content
            if (relativePath.endsWith('.json')) {
              try {
                formattedContent = JSON.stringify(JSON.parse(content), null, 2)
              } catch {
                // Keep original if parsing fails
              }
            }
            return {
              type: 'file',
              relativePath,
              key,
              content: formattedContent,
            }
          }))
        setIsLoading(false)
      })
      .catch((e) => {
        console.log('Got error', e)
        setIsLoading(false)
      })
  }, [previousCode, hadTsErrors, sandstoneExports])

  // Debounce 500ms after typing stops, rate limit to 3s between builds
  const DEBOUNCE_MS = 500
  const RATE_LIMIT_MS = 3000

  // Use ref to hold latest doCompile so debounced function stays stable
  const doCompileRef = useRef(doCompile)
  doCompileRef.current = doCompile

  // Stable debounced compile function - uses ref to always call latest doCompile
  const compile = useCallback(debounce((code: string) => {
    const timeSinceLastBuild = Date.now() - lastBuildTime.current

    // Clear any existing rate limit timeout
    if (rateLimitTimeout.current) {
      clearTimeout(rateLimitTimeout.current)
      rateLimitTimeout.current = null
    }

    if (timeSinceLastBuild >= RATE_LIMIT_MS || lastBuildTime.current === 0) {
      // Can build now - no pending overlay needed, compile starts immediately
      doCompileRef.current(code)
    } else {
      // Need to wait for rate limit
      const waitTime = RATE_LIMIT_MS - timeSinceLastBuild
      rateLimitTimeout.current = setTimeout(() => {
        doCompileRef.current(code)
      }, waitTime)
    }
  }, DEBOUNCE_MS), []) // No dependencies - stable function

  useEffect(() => {
    // Only compile when visible to avoid running all snippets on page load
    if (hasBeenVisible) {
      compile(editorValue)
    }
  }, [editorValue, hasBeenVisible, compile])

  return <div ref={containerRef} style={{
    display: 'flex',
    flexFlow: 'column nowrap',
  }}>
    <div style={{
      display: 'flex',
      flexFlow: 'column nowrap',
    }}>
      {hasBeenVisible ? (
        <Editor ref={editorRef} sandstoneFiles={sandstoneFiles} value={editorValue} setValue={setEditorValue} height={props.height} />
      ) : (
        <div style={{
          height: props.height,
          backgroundColor: 'rgb(30, 30, 30)',
          border: '1px solid #333',
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#666',
        }}>
          Scroll to load editor...
        </div>
      )}
    </div>
    {compiledDataPack.length === 0 && isLoading ? (
      <StatusIndicator status="loading" />
    ) : (
      <div style={{ position: 'relative' }}>
        {isLoading && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            borderRadius: 5,
            zIndex: 1,
          }}>
            <div style={{
              padding: '12px 24px',
              backgroundColor: 'rgb(30, 30, 30)',
              borderRadius: 8,
              color: '#ccc',
              fontSize: '16px',
              fontWeight: 500,
            }}>
              Compiling...
            </div>
          </div>
        )}
        <CodeOutput files={compiledDataPack} />
      </div>
    )}
  </div>
}
