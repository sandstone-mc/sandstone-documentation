import React, { useState } from 'react'
import MonacoEditor, { Monaco } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'

let editorID = 0
export function Editor({ onChange, onError, onReady, sandstoneFiles, initialValue, height }: { sandstoneFiles: [content: string, fileName: string][], onChange?: ((newValue: string) => void), onError?: ((markers: editor.IMarker[]) => void), onReady?: (() => void), initialValue: string, height: number }) {
  const [currentEditorID, setCurrentEditorID] = useState<number | null>(null)
  if (currentEditorID === null) {
    setCurrentEditorID(editorID)
    editorID += 1
    return null
  }

  function handleEditorDidMount(editor: editor.IStandaloneCodeEditor, monaco: Monaco) {
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2016,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      typeRoots: ['node_modules/@types']
    })

    // Load Sandstone
    for (const [fileContent, fileName] of sandstoneFiles) {
      monaco.languages.typescript.typescriptDefaults.addExtraLib(
        fileContent,
        fileName,
      )
    }

    // Diagnostic Options
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    })

    onReady?.()

    if (typeof onChange !== 'undefined') {
      editor.onDidChangeModelContent(() => {
        onChange(editor.getValue())
      })
    }

    if (typeof onError !== 'undefined') {
      monaco.editor.onDidChangeMarkers(() => {
        onError(monaco.editor.getModelMarkers({ resource: new (monaco.Uri as any)('main.ts') }))
      })
    }
  }

  return (
    <MonacoEditor
      height={height}
      defaultLanguage="typescript"
      defaultValue={initialValue}
      defaultPath={"main" + currentEditorID + ".ts"}
      theme="vs-dark"
      onMount={handleEditorDidMount}
      options={{
        folding: true,
        fontFamily: "var(--ifm-font-family-monospace)",
        fontLigatures: false,
        theme: 'vs-dark',
        tabCompletion: 'on',
        fontSize: 15.2,
        minimap: {
          enabled: false,
        },
        lineNumbers: 'off',
        automaticLayout: true,
        scrollBeyondLastLine: false,
        padding: {
          top: 18,
        },
      }}
    />
  )
}

