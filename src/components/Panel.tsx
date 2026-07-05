import type { HTMLAttributes } from 'react'
import clsx from 'clsx'
import theme from '../css/theme.module.css'

interface PanelProps extends HTMLAttributes<HTMLDivElement> {}

export function Panel({ className, children, ...rest }: PanelProps) {
  return (
    <div className={clsx(theme.panel, className)} {...rest}>
      {children}
    </div>
  )
}
