import { useState } from 'react'
import clsx from 'clsx'
import styles from './CommandHint.module.css'

interface CommandHintProps {
  command: string
  className?: string
}

export function CommandHint({ command, className }: CommandHintProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      type="button"
      className={clsx(styles.commandHint, className)}
      onClick={handleCopy}
      title="Copy to clipboard"
    >
      <span className={styles.prompt}>$</span>
      <span className={styles.command}>{command}</span>
      <span className={clsx(styles.copyHint, copied && styles.copied)}>
        {copied ? 'Copied!' : 'Copy'}
      </span>
    </button>
  )
}
