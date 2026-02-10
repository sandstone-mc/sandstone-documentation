import React, { useState, useEffect } from 'react'
import CodeBlock from '@theme/CodeBlock'
import { FileTab } from './FileTab'

// Decode base64-encoded code from the remark plugin (preserves whitespace)
function decodeBase64(encoded: string): string {
  if (typeof atob === 'undefined') {
    // SSR fallback using Buffer
    return Buffer.from(encoded, 'base64').toString('utf-8')
  }
  try {
    return atob(encoded)
  } catch {
    return encoded
  }
}

type Props = {
  height: number
  code?: string
  encodedCode?: string
  filename?: string
  baseImports?: string[]
  children?: string
}

// SSR fallback: static code block with syntax highlighting
const StaticCodeBlock = ({ code, filename }: { code: string, filename?: string }) => (
  <div>
    {filename && <FileTab name={filename} />}
    <CodeBlock language="typescript" title={filename}>
      {code.trim()}
    </CodeBlock>
  </div>
)

export const InteractiveSnippet = (props: Props) => {
  // Support encodedCode (base64 from remark plugin), code prop, or children
  const rawCode = props.encodedCode
    ? decodeBase64(props.encodedCode)
    : (props.code ?? props.children ?? '')

  const [ClientComponent, setClientComponent] = useState<React.ComponentType<any> | null>(null)

  useEffect(() => {
    // Only import on client side, after hydration
    import('./InteractiveSnippetClient').then(mod => {
      setClientComponent(() => mod.InteractiveSnippetClient)
    })
  }, [])

  // SSR and initial client render: show static code block
  if (!ClientComponent) {
    return <StaticCodeBlock code={rawCode} filename={props.filename} />
  }

  // After client component loads: show interactive editor
  return (
    <div>
      {props.filename && <FileTab name={props.filename} />}
      <ClientComponent {...props} rawCode={rawCode} />
    </div>
  )
}
