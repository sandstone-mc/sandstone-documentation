import React from 'react'
import { Tabs } from './Tabs';
import TabItem from '@theme/TabItem';
import { Highlight, themes } from 'prism-react-renderer';
import { CustomHandlerFileObject } from '../utils/compiler';

// Use the dark theme directly - matches what's configured in docusaurus.config.ts
const theme = themes.vsDark

const CodeOutput_ = ({ files }: { files: CustomHandlerFileObject[] | undefined }) => {
  if (!files?.length || typeof window === 'undefined') {
    return <></>
  }
  // Filter out files with undefined content to prevent Prism crashes
  const validFiles = files.filter(f => f.content != null)
  if (!validFiles.length) {
    return <></>
  }
  const filesExtended = validFiles.map(f => {
    // Remove the 3 first folders
    const folders = f.relativePath.split('/')
    const namespace = folders[2]
    const resourceType = folders[3] // function, advancement, loot_table...
    const name = folders.slice(4).join('/')

    return {
      ...f,
      name: namespace === 'default' ? name : `${namespace}:${name}`,
    }
  }).reverse()

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
            filesExtended.map((file,i) => (
              <TabItem value={file.name} key={file.relativePath}>
                <Highlight theme={theme} code={file.content} language={"mcfunction" as "javascript"}>
                  {({ className, style, tokens, getLineProps, getTokenProps }) => (
                    <pre className={className} style={{ ...style, padding: '20px' }}>
                      {tokens.map((line, i) => (
                        <div key={i} {...getLineProps({ line })}>
                          {line.map((token, j) => (
                            <span key={j} {...getTokenProps({ token })} />
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