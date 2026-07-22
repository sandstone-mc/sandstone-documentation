import Link from '@docusaurus/Link'
import { Panel } from '../Panel'
import type { ShowcaseProject } from './types'
import { tagAccentVar } from './tagAccent'
import styles from './Showcase.module.css'

export function ProjectCard({ project }: { project: ShowcaseProject }) {
  const thumbnail = project.images[0]

  return (
    <Link to={`/showcase/${project.slug}`} className={styles.cardLink}>
      <Panel className={styles.card}>
        {thumbnail && (
          <div className={styles.cardThumbnailSlot}>
            <img className={styles.cardThumbnail} src={thumbnail.src} alt={thumbnail.alt} />
            {/* {project.featured && <span className={styles.featuredBadge}>Featured</span>} */}
          </div>
        )}
        <div className={styles.cardBody}>
          <h3 className={styles.cardTitle}>{project.title}</h3>
          <p className={styles.cardTagline}>{project.tagline}</p>
          {project.tags && project.tags.length > 0 && (
            <div className={styles.tagRow}>
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className={styles.tag}
                  style={{ ['--tag-accent' as string]: `var(${tagAccentVar(tag)})` }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Panel>
    </Link>
  )
}
