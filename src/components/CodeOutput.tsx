import React from 'react'
import { Tabs } from './Tabs';
import TabItem from '@theme/TabItem';
import { Highlight } from 'prism-react-renderer';
import { CustomHandlerFileObject } from '../utils/compiler';


const config = require('../../docusaurus.config').default;
const theme = config.themeConfig.prism.theme

const CodeOutput_ = ({ files }: { files: CustomHandlerFileObject[] | undefined }) => {
  if (!files.length || typeof window === 'undefined') {
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
              <TabItem value={file.name} key={file.relativePath}>
                <Highlight theme={theme} code={file.content} language={"mcfunction" as "javascript"}>
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
                </Highlight>
              </TabItem>
            ))
          }
        </Tabs>
      </div>
    </div>
  )
}

export const CodeOutput = React.memo(CodeOutput_)