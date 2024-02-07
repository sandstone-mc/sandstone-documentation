import React, { useState } from 'react'
import MonacoEditor, { Monaco } from '@monaco-editor/react'
import type { editor, Position } from 'monaco-editor'
import { useComponentId } from '../utils/getUniqueId'

function Editor_({ onError, onReady, sandstoneFiles, value, setValue, height }: { sandstoneFiles: [content: string, fileName: string][], onError?: ((markers: editor.IMarker[]) => void), onReady?: (() => void), value: string, setValue: (value: string) => void, height: number }) {
  const currentEditorID = useComponentId()
  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
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

    if (typeof onError !== 'undefined') {
      monaco.editor.onDidChangeMarkers(() => {
        onError(monaco.editor.getModelMarkers({ resource: new (monaco.Uri as any)('main.ts') }))
      })
    }

    let cursorPos: Position
    editor.onDidChangeCursorPosition((p) => {
      // Prevents model changes to move the cursor to the end of the block of code
      if (p.source === 'modelChange') {
        if (cursorPos && !p.position.equals(cursorPos)) {
          editor.setPosition(cursorPos)
        }
      }
      else {
        cursorPos = p.position
      }
    })
    // editor.onKeyDown(e => {
    //   // If the user tries to modify the first line, stop him
    //   const readonlyRange = new monaco.Range(0, 0, 2, 0)
    //   const contains = editor.getSelections().find(range => readonlyRange.intersectRanges(range)) !== undefined
    //   if (
    //     contains
    //     && (e.browserEvent.key.length === 1 || ['enter', 'backspace'].includes(e.browserEvent.key.toLowerCase()))
    //     && !(['c', 'a'].includes(e.browserEvent.key.toLowerCase()) && e.ctrlKey) // Let Ctrl+C & Ctrl+A pass
    //   ) {
    //     e.stopPropagation()
    //     e.preventDefault()
    //     return
    //   }

    //   // If the user is on the start of the 2nde line & hits backspace, prevent him
    //   const backspaceContains = editor.getSelections().find(range => range.endLineNumber === 2 && range.endColumn === 1) !== undefined
    //   if (backspaceContains && e.browserEvent.key.toLowerCase() === 'backspace') {
    //     e.stopPropagation()
    //     return
    //   }
    // });
  }

  return (
    <MonacoEditor
      height={height}
      defaultLanguage="typescript"
      value={value}
      defaultPath={"main" + currentEditorID + ".ts"}
      theme="vs-dark"
      onChange={setValue}
      onMount={handleEditorDidMount}
      options={{
        folding: true,
        fontFamily: "var(--ifm-font-family-monospace)",
        fontLigatures: false,
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
        scrollbar: {
          alwaysConsumeMouseWheel: false,
        }
      }}
    />
  )
}

export const Editor = React.memo(Editor_)

