import React, { useCallback, useEffect, useState } from 'react'
import { usePluginData } from '@docusaurus/useGlobalData'
import { Editor } from './Editor'
import { CustomHandlerFileObject, compileDataPack } from '../utils/compiler'
import type { editor } from 'monaco-editor'
import { CodeOutput } from './CodeOutput'
import { FileTab } from './FileTab'
import { debounce } from 'lodash'

function getCodeWithoutImports(code: string) {
  return code.split('\n').slice(1).join('\n')
}

type Props = { height: number, code: string, filename?: string, baseImports?: string[] }

export const InteractiveSnippet = (props: Props) => {
  // const { sandstoneFiles } = usePluginData('get-sandstone-files') as { sandstoneFiles: [content: string, fileName: string][] }
  const sandstoneFiles = [["content", "fileName.ts"]] as [content: string, fileName: string][]
  const [compiledDataPack, setCompiledDataPack] = useState<CustomHandlerFileObject[]>([])
  const [editorErrors, setEditorErrors] = useState<editor.IMarker[]>([])

  const [editorValue, setEditorValue] = useState(`
import { ${(props.baseImports ?? []).join(', ')} } from 'sandstone'

${props.code.trim()}`.trim())

  const [previousCode, setPreviousCode] = useState('props.code.trim()')

  const compile = useCallback(debounce((code: string, errors: typeof editorErrors) => {
    if (previousCode === code.trim()) {
      return
    }

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
      .then(({ result }) => {
        setCompiledDataPack(Object.entries(result).map(([relativePath, content], key) => ({
          type: 'file',
          relativePath,
          key,
          content,
          })))
      })
      .catch((e) => {
        console.log('Got error', e)
      })
  }, 500, { leading: false, trailing: true }), [setEditorValue, setPreviousCode, previousCode])

  useEffect(() => {
    compile(editorValue, editorErrors)
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
