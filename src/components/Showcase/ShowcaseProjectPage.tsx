import { useState } from 'react'
import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'
import ReactMarkdown from 'react-markdown'
import { Panel } from '../Panel'
import { Button } from '../Button'
import { Lightbox } from './Lightbox'
import { GalleryCarousel } from './GalleryCarousel'
import type { ShowcaseImage, ShowcaseProject, PlatformType } from './types'
import { tagAccentVar } from './tagAccent'
import { iconPath, PLATFORM_META } from './icons'
import styles from './Showcase.module.css'

interface ShowcaseProjectPageProps {
  project: ShowcaseProject
}

const PLATFORM_TYPES: PlatformType[] = ['modrinth', 'smithed', 'planetminecraft']

export default function ShowcaseProjectPage({ project }: ShowcaseProjectPageProps) {
  const [lightboxImage, setLightboxImage] = useState<ShowcaseImage | null>(null)
  const [heroImage, ...galleryImages] = project.images

  const platformLinks = PLATFORM_TYPES.filter((platform) => project.links[platform])
  const hasLinks = Boolean(project.links.source || project.links.website || platformLinks.length > 0)

  return (
    <Layout title={project.title} description={project.tagline}>
      <div className={styles.page}>
        {heroImage && (
          <div className={styles.heroWrapper}>
            <img className={styles.heroImage} src={heroImage.src} alt={heroImage.alt} />
            <div className={styles.heroScrim} />
            <Link to="/showcase" className={styles.heroBackLink}>&larr; Back to Showcase</Link>
            <div className={styles.heroContent}>
              <h1 className={styles.heroTitle}>{project.title}</h1>
              <p className={styles.heroTagline}>{project.tagline}</p>
            </div>
          </div>
        )}

        <div className={styles.contentGrid}>
          <main className={styles.mainColumn}>
            {!heroImage && (
              <header className={styles.detailHeaderNoHero}>
                <Link to="/showcase" className={styles.backLink}>&larr; Back to Showcase</Link>
                <h1 className={styles.detailTitle}>{project.title}</h1>
                <p className={styles.detailTagline}>{project.tagline}</p>
              </header>
            )}

            {project.video && (
              <section>
                <h2 className={styles.sectionHeading}>Trailer</h2>
                <Panel className={styles.videoPanel}>
                  <div className={styles.videoWrapper}>
                    <iframe
                      src={project.video}
                      title={`${project.title} trailer`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </Panel>
              </section>
            )}

            <section>
              <h2 className={styles.sectionHeading}>About</h2>
              <div className={styles.description}>
                {project.description.map((paragraph, idx) => (
                  <ReactMarkdown key={idx}>{paragraph}</ReactMarkdown>
                ))}
              </div>
            </section>

            {galleryImages.length > 0 && (
              <section>
                <h2 className={styles.sectionHeading}>Gallery</h2>
                <GalleryCarousel images={galleryImages} onImageClick={setLightboxImage} />
              </section>
            )}
          </main>

          <aside className={styles.sidebar}>
            {project.credits && project.credits.length > 0 && (
              <Panel className={styles.sidebarPanel}>
                <h3 className={styles.sidebarHeading}>Credits</h3>
                <div className={styles.creditGroups}>
                  {project.credits.map((group) => (
                    <div key={group.section} className={styles.creditGroup}>
                      <h4 className={styles.creditGroupHeading}>{group.section}</h4>
                      <div className={styles.authorList}>
                        {group.members.map((author) => (
                          <div key={author.name} className={styles.authorRow}>
                            {author.minecraft && (
                              <img
                                className={styles.authorHead}
                                src={`https://crafthead.net/helm/${author.minecraft.uuid || author.minecraft.hash}`}
                                alt=""
                              />
                            )}
                            {author.role ? (
                              <span className={styles.authorNameRole}>
                                {author.name}
                                <span className={styles.roleTooltip}>{author.role}</span>
                              </span>
                            ) : (
                              <span className={styles.authorName}>{author.name}</span>
                            )}
                            {author.socials && author.socials.length > 0 && (
                              <div className={styles.authorSocials}>
                                {author.socials.map((social) => (
                                  <a
                                    key={social.type}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={social.type}
                                  >
                                    <img src={iconPath(social.type)} alt="" className={styles.socialIcon} />
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {project.tags && project.tags.length > 0 && (
              <Panel className={styles.sidebarPanel}>
                <h3 className={styles.sidebarHeading}>Tags</h3>
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
              </Panel>
            )}

            {hasLinks && (
              <Panel className={styles.sidebarPanel}>
                <h3 className={styles.sidebarHeading}>Links</h3>
                <div className={styles.linkColumn}>
                  {project.links.source && (
                    <Button variant="secondary" size="sm" href={project.links.source} target="_blank" rel="noopener noreferrer">
                      <img src={iconPath('github')} alt="" className={styles.buttonIcon} />
                      View Source
                    </Button>
                  )}
                  {project.links.website && (
                    <Button variant="secondary" size="sm" href={project.links.website} target="_blank" rel="noopener noreferrer">
                      Website
                    </Button>
                  )}
                  {platformLinks.map((platform) => (
                    <a
                      key={platform}
                      href={project.links[platform]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.platformButton}
                      style={{ ['--button-color' as string]: PLATFORM_META[platform].color }}
                    >
                      <img src={iconPath(platform)} alt="" className={styles.buttonIcon} />
                      {PLATFORM_META[platform].label}
                    </a>
                  ))}
                </div>
              </Panel>
            )}
          </aside>
        </div>
      </div>
      <Lightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
    </Layout>
  )
}
