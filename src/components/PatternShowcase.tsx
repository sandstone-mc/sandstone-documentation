import React, { useState, type ReactNode } from 'react'
import clsx from 'clsx'
import { Highlight, themes } from 'prism-react-renderer'
import { Panel } from './Panel'
import styles from './PatternShowcase.module.css'

export interface GeneratedFile {
  name: string
  content: string
}

export interface PatternDemo {
  title: string
  filename: string
  description: ReactNode
  code: string
  generatedFiles: GeneratedFile[]
}

const theme = themes.vsDark

function languageForFile(name: string): string {
  const ext = name.split('.').pop()
  return ext === 'json' ? 'json' : 'mcfunction'
}

function CodeFile({ name, content, language }: { name: string; content: string; language: string }) {
  return (
    <div className={styles.outputFile}>
      <div className={styles.outputFileName}>{name}</div>
      <Highlight theme={theme} code={content.trim()} language={language as 'tsx'}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={clsx(className, styles.pre)} style={style}>
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
    </div>
  )
}

function GeneratedOutput({ files }: { files: GeneratedFile[] }) {
  return (
    <div className={styles.output}>
      {files.map((f) => (
        <CodeFile key={f.name} name={f.name} content={f.content} language={languageForFile(f.name)} />
      ))}
    </div>
  )
}

export function PatternShowcase({ demos }: { demos: PatternDemo[] }) {
  const [activeDemo, setActiveDemo] = useState(0)
  const [activeTab, setActiveTab] = useState<'code' | 'output'>('code')
  const demo = demos[activeDemo]

  return (
    <Panel className={styles.showcase}>
      <div className={styles.sidebar}>
        {demos.map((d, i) => (
          <button
            key={d.filename}
            type="button"
            className={clsx(styles.sidebarItem, i === activeDemo && styles.sidebarItemActive)}
            onClick={() => {
              setActiveDemo(i)
              setActiveTab('code')
            }}
          >
            {d.title}
          </button>
        ))}
      </div>
      <div className={styles.content}>
        <p className={styles.description}>{demo.description}</p>
        <div className={styles.subTabs}>
          <button
            type="button"
            className={clsx(styles.subTab, activeTab === 'code' && styles.subTabActive)}
            onClick={() => setActiveTab('code')}
          >
            TypeScript
          </button>
          <button
            type="button"
            className={clsx(styles.subTab, activeTab === 'output' && styles.subTabActive)}
            onClick={() => setActiveTab('output')}
          >
            Generated
          </button>
        </div>
        {activeTab === 'code' ? (
          <CodeFile name={demo.filename} content={demo.code} language="typescript" />
        ) : (
          <GeneratedOutput files={demo.generatedFiles} />
        )}
      </div>
    </Panel>
  )
}
