import React, { useCallback, useEffect, useState } from 'react'
import { usePluginData } from '@docusaurus/useGlobalData'
import { Editor } from './Editor'
import { CustomHandlerFileObject, compileDataPack } from '../utils/compiler'
import type { editor } from 'monaco-editor'
import { CodeOutput } from './CodeOutput'
import { FileTab } from './FileTab'

function getCodeWithoutImports(code: string) {
  return code.split('\n').slice(3).join('\n')
}

export const InteractiveSnippet = (props: { height: number, code: string, filename?: string }) => {
  const { sandstoneFiles } = usePluginData('get-sandstone-files') as { sandstoneFiles: [content: string, fileName: string][] }
  const [compiledDataPack, setCompiledDataPack] = useState<CustomHandlerFileObject[]>([])
  const [editorErrors, setEditorErrors] = useState<editor.IMarker[]>([])

  const [editorValue, setEditorValue] = useState(`
//@ts-ignore
import {} from 'sandstone'

${props.code.trim()}`.trim())

  const [previousCode, setPreviousCode] = useState('props.code.trim()')

  const compile = (code: string, errors: typeof editorErrors) => {
    if (previousCode === code.trim()) {
      return
    }

    setPreviousCode(code.trim())

    for (const error of errors) {
      if (error.owner === 'typescript' && error.severity > 1) {
        setCompiledDataPack([errors.reduce((reduced, error) => ({
          ...reduced,
          ...(error.owner === 'typescript' ? {
            content: `${reduced.content}[${error.startLineNumber}:${error.startColumn}] ${error.message}\n`
          } : {})
        }), { type: 'errors', relativePath: 'Failed to Compile:', key: 0, content: '' })])
        return
      }
    }
    compileDataPack(code)
      .then(({ result, imports }) => {
        setCompiledDataPack(result)
        const newEditorValue = `//@ts-ignore
import { ${Array.from(imports).join(', ')} } from 'sandstone'

${code}`
        if (newEditorValue !== editorValue) {
          setEditorValue(newEditorValue)
        }
      })
      .catch((e) => {
        console.log('Got error', e)
      })
  }

  useEffect(() => {
    compile(getCodeWithoutImports(editorValue), editorErrors)
  }, [editorValue, editorErrors])

  return <div style={{
    display: 'flex',
    flexFlow: 'column nowrap',
  }}>
    <div style={{
      display: 'flex',
      flexFlow: 'column nowrap',
    }}>
      {props.filename ? <FileTab name={props.filename} /> : <></>}
      <Editor sandstoneFiles={sandstoneFiles} value={editorValue} setValue={setEditorValue} height={props.height} onError={setEditorErrors} />
    </div>
    <CodeOutput files={compiledDataPack} />
  </div>
}