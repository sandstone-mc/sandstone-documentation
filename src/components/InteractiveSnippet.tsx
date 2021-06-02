import React, { useCallback, useEffect, useState } from 'react'
import { usePluginData } from '@docusaurus/useGlobalData'
import { Editor } from './Editor';
import { CustomHandlerFileObject, compileDataPack } from '../utils/compiler';
import type { editor } from 'monaco-editor';
import { debounce } from 'lodash';
import { CodeOutput } from './CodeOutput';

export const InteractiveSnippet = (props: { height: number, code: string }) => {
  const { sandstoneFiles } = usePluginData('get-sandstone-files') as { sandstoneFiles: [content: string, fileName: string][] };
  const [compiledDataPack, setCompiledDataPack] = useState<CustomHandlerFileObject[]>([]);
  const [editorErrors, setEditorErrors] = useState<editor.IMarker[]>([]);
  const [previousCode, setPreviousCode] = useState('');

  const [editorValue, setEditorValue] = useState(`
//@ts-ignore
import {} from 'sandstone'

${props.code}`.trim());

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
        }), { type: 'errors', relativePath: 'Failed to Compile:', key: 0, content: '' })]);
        return;
      }
    }

    const result = compileDataPack(code)

    result.then(({ result, imports }) => {
      setCompiledDataPack(result)
      const newEditorValue = `//@ts-ignore
import { ${Array.from(imports).join(', ')} } from 'sandstone'

${code}`
      console.log('gogogo')
      if (newEditorValue !== editorValue) {
        setEditorValue(editorValue)
      }
    })
      .catch((e) => {
        console.log('Got error', e)
      })
  }

  useEffect(() => {
    compile(editorValue.split('\n').slice(3).join('\n'), editorErrors)
  }, [editorValue, editorErrors])

  return <div style={{
    display: 'flex',
    flexFlow: 'column nowrap',
  }}>
    <Editor sandstoneFiles={sandstoneFiles} value={editorValue} setValue={setEditorValue} height={props.height} onError={setEditorErrors} />
    <CodeOutput files={compiledDataPack} />
  </div>
}