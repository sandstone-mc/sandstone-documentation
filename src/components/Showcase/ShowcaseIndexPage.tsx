import { useMemo, useState } from 'react'
import clsx from 'clsx'
import Layout from '@theme/Layout'
import { Panel } from '../Panel'
import { Button } from '../Button'
import { ProjectGrid } from './ProjectGrid'
import type { ShowcaseProject } from './types'
import { tagAccentVar } from './tagAccent'
import styles from './Showcase.module.css'

const DISCORD_INVITE = 'https://discord.gg/4tzM5aXDRe'

interface ShowcaseIndexPageProps {
  projects: ShowcaseProject[]
}

export default function ShowcaseIndexPage({ projects }: ShowcaseIndexPageProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    for (const project of projects) {
      for (const tag of project.tags ?? []) tags.add(tag)
    }
    return Array.from(tags).sort()
  }, [projects])

  const visibleProjects = activeTag
    ? projects.filter((project) => project.tags?.includes(activeTag))
    : projects

  return (
    <Layout
      title="Showcase"
      description="Real projects built with Sandstone."
    >
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.headerTitle}>Community Showcase</h1>
          <p className={styles.headerSubtitle}>
            Real packs, minigames, events, and more built with Sandstone.
          </p>
        </header>
        <main className={styles.indexMain}>
          {allTags.length > 0 && (
            <div className={styles.filterRow}>
              <button
                type="button"
                className={clsx(styles.filterChip, activeTag === null && styles.filterChipActive)}
                onClick={() => setActiveTag(null)}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={clsx(styles.filterChip, activeTag === tag && styles.filterChipActive)}
                  style={{ ['--tag-accent' as string]: `var(${tagAccentVar(tag)})` }}
                  onClick={() => setActiveTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          <ProjectGrid className={styles.grid} />

          <Panel className={styles.showcaseCtaPanel}>
            <h2 className={styles.showcaseCtaTitle}>Built something with Sandstone?</h2>
            <p className={styles.showcaseCtaSubtitle}>
              Share it in our Discord and we'll feature it here.
            </p>
            <Button variant="primary" href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">
              Join the Discord
            </Button>
          </Panel>
        </main>
      </div>
    </Layout>
  )
}
