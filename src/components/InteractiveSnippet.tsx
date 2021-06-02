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
  const [editorValue, setEditorValue] = useState(props.code);

  const compile = useCallback(debounce((code: string, errors: typeof editorErrors) => {
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

    compileDataPack(code)
      .then(r => setCompiledDataPack(r))
      .catch((e) => {
        console.log('Got error', e)
      })
  }, 400, { trailing: true }), [setCompiledDataPack])

  useEffect(() => {
    compile(editorValue, editorErrors)
  }, [editorValue, editorErrors])

  return <div style={{
    display: 'flex',
    flexFlow: 'column nowrap',
  }}>
    <Editor sandstoneFiles={sandstoneFiles} initialValue={props.code.trim()} height={props.height} onChange={setEditorValue} onError={setEditorErrors} />
    <CodeOutput files={compiledDataPack} />
  </div>
}