import React, { type ReactNode } from 'react'
import clsx from 'clsx'
import type { Props } from '@theme/NotFound/Content'
import { Button, Panel } from '../../../components'
import styles from './styles.module.css'

export default function NotFoundContent({ className }: Props): ReactNode {
  return (
    <main className={clsx(styles.voidWrapper, className)}>
      <Panel className={styles.panel}>
        <h1 className={styles.title}>You fell out of the world</h1>
        <p className={styles.subtitle}>
          Whatever you were looking for isn't in this dimension.
        </p>
        <div className={styles.actions}>
          <Button variant="primary" to="/">
            Respawn
          </Button>
          <Button variant="secondary" to="/docs/">
            Docs
          </Button>
        </div>
      </Panel>
    </main>
  )
}
