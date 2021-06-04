import React from 'react'
import Tabs from './Tabs';
import TabItem from '@theme/TabItem';
import Hightlight, { defaultProps } from 'prism-react-renderer';
import { SaveOptions } from 'sandstone/datapack/saveDatapack';
import { FileTab } from './FileTab';

export type CustomHandlerFileObject = (Parameters<Required<SaveOptions>['customFileHandler']>[0] & { key: number }) | { type: 'errors', relativePath: string, content: string, key: number };

const theme = require('../../docusaurus.config').themeConfig.prism.theme.default

const CodeOutput_ = ({ files }: { files: CustomHandlerFileObject[] | undefined }) => {
  if (!files.length) {
    return <></>
  }
  const filesExtended = files.map(f => {
    // Remove the 3 first folders
    const folders = f.relativePath.split('/')

    const namespace = folders[1]
    const resourceType = folders[2] // function, advancement, loot_table...
    const name = folders.slice(3).join('/')

    return {
      ...f,
      name: namespace === 'default' ? name : `${namespace}:${name}`,
    }
  })

  return (
    <div style={{
      margin: '10px auto',
      border: '2px solid rgb(30, 30, 30)',
      borderRadius: 5,
      width: '100%',
    }}>
      <div style={{
        padding: '0 2.5%',
      }}>
        <Tabs
          defaultValue={filesExtended[0].name}
          values={filesExtended.map(({ name }) => ({ label: name, value: name }))}
        >
          {
            filesExtended.map((file) => (
              <TabItem value={file.name} key={file.name}>
                <Hightlight {...defaultProps} theme={theme} code={file.content} language={"mcfunction" as "javascript"}>
                  {({ className, style, tokens, getLineProps, getTokenProps }) => (
                    <pre className={className} style={{ ...style, padding: '20px' }}>
                      {tokens.map((line, i) => (
                        <div key={i} {...getLineProps({ line, key: i })}>
                          {line.map((token, key) => (
                            <span key={key} {...getTokenProps({ token, key })} />
                          ))}
                        </div>
                      ))}
                    </pre>
                  )}
                </Hightlight>
              </TabItem>
            ))
          }
        </Tabs>
      </div>
    </div>
  )
}

export const CodeOutput = React.memo(CodeOutput_)