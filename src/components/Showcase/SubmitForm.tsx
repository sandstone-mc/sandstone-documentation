import { useMemo, useState } from 'react'
import type { ChangeEvent, ReactNode } from 'react'
import { Panel } from '../Panel'
import { Button } from '../Button'
import { tagAccentVar } from './tagAccent'
import { iconPath } from './icons'
import type {
  IconType,
  ShowcaseAuthor,
  ShowcaseCreditGroup,
  ShowcaseLinks,
  ShowcaseProject,
} from './types'
import showcaseStyles from './Showcase.module.css'
import styles from './Submit.module.css'

const ICON_LABELS: Record<IconType, string> = {
  bluesky: 'Bluesky',
  discord: 'Discord',
  github: 'GitHub',
  instagram: 'Instagram',
  kofi: 'Ko-fi',
  mapverse: 'Mapverse',
  modrinth: 'Modrinth',
  patreon: 'Patreon',
  planetminecraft: 'Planet Minecraft',
  smithed: 'Smithed',
  twitch: 'Twitch',
  twitter: 'Twitter / X',
  website: 'Website',
  youtube: 'YouTube',
}

const ICON_TYPES = Object.keys(ICON_LABELS) as IconType[]

interface DraftSocial {
  type: IconType
  url: string
}

interface DraftAuthor {
  name: string
  minecraft: {
    uuid?: string;
    hash?: string;
  }
  role: string
  socials: DraftSocial[]
}

interface DraftCreditGroup {
  section: string
  members: DraftAuthor[]
}

interface DraftImage {
  filename: string
  alt: string
}

interface DraftLinks {
  source: string
  website: string
  modrinth: string
  smithed: string
  planetminecraft: string
}

interface DraftState {
  title: string
  slug: string
  slugTouched: boolean
  tagline: string
  description: string[]
  images: DraftImage[]
  video: string
  credits: DraftCreditGroup[]
  links: DraftLinks
  tags: string[]
}

function emptyDraft(): DraftState {
  return {
    title: '',
    slug: '',
    slugTouched: false,
    tagline: '',
    description: [''],
    images: [{ filename: '', alt: '' }],
    video: '',
    credits: [],
    links: { source: '', website: '', modrinth: '', smithed: '', planetminecraft: '' },
    tags: [],
  }
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function updateAt<T>(arr: T[], index: number, value: T): T[] {
  const copy = arr.slice()
  copy[index] = value
  return copy
}

function removeAt<T>(arr: T[], index: number): T[] {
  return arr.filter((_, i) => i !== index)
}

function buildProject(draft: DraftState): Omit<ShowcaseProject, 'featured'> {
  const description = draft.description.map((p) => p.trim()).filter(Boolean)

  const images = draft.images
    .filter((image) => image.filename.trim())
    .map((image) => ({
      src: `/img/showcase/${draft.slug.trim() || '<slug>'}/${image.filename.trim()}`,
      alt: image.alt.trim(),
    }))

  const credits: ShowcaseCreditGroup[] = draft.credits
    .map((group) => ({
      section: group.section.trim(),
      members: group.members
        .filter((member) => member.name.trim())
        .map((member): ShowcaseAuthor => {
          const socials = member.socials.filter((social) => social.url.trim())
          const cleaned: ShowcaseAuthor = { name: member.name.trim() }
          if (member.minecraft) {
            cleaned.minecraft = {};
            if (member.minecraft.hash) cleaned.minecraft.hash = member.minecraft.hash.trim()
            if (member.minecraft.uuid) cleaned.minecraft.uuid = member.minecraft.uuid.trim()
          }
          if (member.role.trim()) cleaned.role = member.role.trim()
          if (socials.length > 0) {
            cleaned.socials = socials.map((social) => ({ type: social.type, url: social.url.trim() }))
          }
          return cleaned
        }),
    }))
    .filter((group) => group.section && group.members.length > 0)

  const links: ShowcaseLinks = {}
  if (draft.links.source.trim()) links.source = draft.links.source.trim()
  if (draft.links.website.trim()) links.website = draft.links.website.trim()
  if (draft.links.modrinth.trim()) links.modrinth = draft.links.modrinth.trim()
  if (draft.links.smithed.trim()) links.smithed = draft.links.smithed.trim()
  if (draft.links.planetminecraft.trim()) links.planetminecraft = draft.links.planetminecraft.trim()

  const project: Omit<ShowcaseProject, 'featured'> = {
    slug: draft.slug.trim(),
    title: draft.title.trim(),
    tagline: draft.tagline.trim(),
    description,
    images,
    video: draft.video.trim() || null,
    links,
    lastUpdated: todayISO(),
  }

  if (credits.length > 0) project.credits = credits
  if (draft.tags.length > 0) project.tags = draft.tags

  return project
}

function extractImageFilename(src: string, slug: string): string {
  const prefix = `/img/showcase/${slug}/`
  if (slug && src.startsWith(prefix)) return src.slice(prefix.length)
  const parts = src.split('/')
  return parts[parts.length - 1] || src
}

function projectToDraft(project: Partial<ShowcaseProject>): DraftState {
  const slug = project.slug ?? ''

  const images: DraftImage[] =
    Array.isArray(project.images) && project.images.length > 0
      ? project.images.map((image) => ({
          filename: extractImageFilename(image?.src ?? '', slug),
          alt: image?.alt ?? '',
        }))
      : [{ filename: '', alt: '' }]

  const credits: DraftCreditGroup[] = Array.isArray(project.credits)
    ? project.credits.map((group) => ({
        section: group?.section ?? '',
        members: Array.isArray(group?.members)
          ? group.members.map((member) => ({
              name: member?.name ?? '',
              minecraft: member?.minecraft ?? {},
              role: member?.role ?? '',
              socials: Array.isArray(member?.socials)
                ? member.socials.map((social) => ({ type: social?.type ?? 'github', url: social?.url ?? '' }))
                : [],
            }))
          : [],
      }))
    : []

  const links = project.links ?? {}

  return {
    title: project.title ?? '',
    slug,
    slugTouched: Boolean(slug),
    tagline: project.tagline ?? '',
    description: Array.isArray(project.description) && project.description.length > 0 ? project.description : [''],
    images,
    video: project.video ?? '',
    credits,
    links: {
      source: links.source ?? '',
      website: links.website ?? '',
      modrinth: links.modrinth ?? '',
      smithed: links.smithed ?? '',
      planetminecraft: links.planetminecraft ?? '',
    },
    tags: Array.isArray(project.tags) ? project.tags : [],
  }
}

function getMissingFields(draft: DraftState): string[] {
  const missing: string[] = []
  if (!draft.title.trim()) missing.push('Title')
  if (!draft.tagline.trim()) missing.push('Tagline')
  if (!draft.slug.trim()) missing.push('Slug')
  if (!draft.description.some((p) => p.trim())) missing.push('At least one description paragraph')
  return missing
}

function Field({ label, hint, icon, children }: { label: string; hint?: string; icon?: string; children: ReactNode }) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>
        {icon && <img src={icon} alt="" className={styles.labelIcon} />}
        {label}
      </span>
      {children}
      {hint && <span className={styles.hint}>{hint}</span>}
    </label>
  )
}

function IconSelect({ value, onChange }: { value: IconType; onChange: (type: IconType) => void }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className={styles.iconSelect}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false)
      }}
    >
      <button type="button" className={styles.iconSelectButton} onClick={() => setOpen((prev) => !prev)}>
        <img src={iconPath(value)} alt="" className={showcaseStyles.socialIcon} />
        <span>{ICON_LABELS[value]}</span>
      </button>
      {open && (
        <ul className={styles.iconSelectMenu}>
          {ICON_TYPES.map((type) => (
            <li key={type}>
              <button
                type="button"
                className={styles.iconSelectOption}
                onClick={() => {
                  onChange(type)
                  setOpen(false)
                }}
              >
                <img src={iconPath(type)} alt="" className={showcaseStyles.socialIcon} />
                <span>{ICON_LABELS[type]}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function SubmitForm() {
  const [draft, setDraft] = useState<DraftState>(emptyDraft)
  const [tagInput, setTagInput] = useState('')
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle')
  const [importText, setImportText] = useState('')
  const [importError, setImportError] = useState<string | null>(null)

  const project = useMemo(() => buildProject(draft), [draft])
  const missing = useMemo(() => getMissingFields(draft), [draft])
  const json = useMemo(() => JSON.stringify(project, null, 2), [project])

  function handleLoadImport(text: string) {
    try {
      const parsed = JSON.parse(text)
      if (typeof parsed !== 'object' || parsed === null) throw new Error('not an object')
      setDraft(projectToDraft(parsed))
      setImportError(null)
    } catch {
      setImportError("Couldn't parse that as JSON — check for a copy/paste error.")
    }
  }

  function handleImportFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result ?? '')
      setImportText(text)
      handleLoadImport(text)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function handleTitleChange(value: string) {
    setDraft((prev) => ({
      ...prev,
      title: value,
      slug: prev.slugTouched ? prev.slug : slugify(value),
    }))
  }

  function handleSlugChange(value: string) {
    setDraft((prev) => ({ ...prev, slug: value, slugTouched: true }))
  }

  function handleDescriptionChange(index: number, value: string) {
    setDraft((prev) => ({ ...prev, description: updateAt(prev.description, index, value) }))
  }

  function addDescriptionParagraph() {
    setDraft((prev) => ({ ...prev, description: [...prev.description, ''] }))
  }

  function removeDescriptionParagraph(index: number) {
    setDraft((prev) => ({ ...prev, description: removeAt(prev.description, index) }))
  }

  function handleImageChange(index: number, field: keyof DraftImage, value: string) {
    setDraft((prev) => ({
      ...prev,
      images: updateAt(prev.images, index, { ...prev.images[index], [field]: value }),
    }))
  }

  function addImage() {
    setDraft((prev) => ({ ...prev, images: [...prev.images, { filename: '', alt: '' }] }))
  }

  function removeImage(index: number) {
    setDraft((prev) => ({ ...prev, images: removeAt(prev.images, index) }))
  }

  function addCreditGroup() {
    setDraft((prev) => ({ ...prev, credits: [...prev.credits, { section: '', members: [] }] }))
  }

  function removeCreditGroup(groupIndex: number) {
    setDraft((prev) => ({ ...prev, credits: removeAt(prev.credits, groupIndex) }))
  }

  function handleGroupSectionChange(groupIndex: number, value: string) {
    setDraft((prev) => ({
      ...prev,
      credits: updateAt(prev.credits, groupIndex, { ...prev.credits[groupIndex], section: value }),
    }))
  }

  function addMember(groupIndex: number) {
    setDraft((prev) => {
      const group = prev.credits[groupIndex]
      const member: DraftAuthor = { name: '', minecraft: {}, role: '', socials: [] }
      const updatedGroup = { ...group, members: [...group.members, member] }
      return { ...prev, credits: updateAt(prev.credits, groupIndex, updatedGroup) }
    })
  }

  function removeMember(groupIndex: number, memberIndex: number) {
    setDraft((prev) => {
      const group = prev.credits[groupIndex]
      const updatedGroup = { ...group, members: removeAt(group.members, memberIndex) }
      return { ...prev, credits: updateAt(prev.credits, groupIndex, updatedGroup) }
    })
  }

  function handleMemberChange(groupIndex: number, memberIndex: number, field: 'name' | 'minecraft' | 'role', value: string) {
    setDraft((prev) => {
      const group = prev.credits[groupIndex]
      const member = { ...group.members[memberIndex], [field]: value }
      const updatedGroup = { ...group, members: updateAt(group.members, memberIndex, member) }
      return { ...prev, credits: updateAt(prev.credits, groupIndex, updatedGroup) }
    })
  }

  function addSocial(groupIndex: number, memberIndex: number) {
    setDraft((prev) => {
      const group = prev.credits[groupIndex]
      const member = group.members[memberIndex]
      const updatedMember = { ...member, socials: [...member.socials, { type: 'github' as IconType, url: '' }] }
      const updatedGroup = { ...group, members: updateAt(group.members, memberIndex, updatedMember) }
      return { ...prev, credits: updateAt(prev.credits, groupIndex, updatedGroup) }
    })
  }

  function removeSocial(groupIndex: number, memberIndex: number, socialIndex: number) {
    setDraft((prev) => {
      const group = prev.credits[groupIndex]
      const member = group.members[memberIndex]
      const updatedMember = { ...member, socials: removeAt(member.socials, socialIndex) }
      const updatedGroup = { ...group, members: updateAt(group.members, memberIndex, updatedMember) }
      return { ...prev, credits: updateAt(prev.credits, groupIndex, updatedGroup) }
    })
  }

  function handleSocialChange(groupIndex: number, memberIndex: number, socialIndex: number, field: 'type' | 'url', value: string) {
    setDraft((prev) => {
      const group = prev.credits[groupIndex]
      const member = group.members[memberIndex]
      const social = { ...member.socials[socialIndex], [field]: value }
      const updatedMember = { ...member, socials: updateAt(member.socials, socialIndex, social) }
      const updatedGroup = { ...group, members: updateAt(group.members, memberIndex, updatedMember) }
      return { ...prev, credits: updateAt(prev.credits, groupIndex, updatedGroup) }
    })
  }

  function handleLinkChange(field: keyof DraftLinks, value: string) {
    setDraft((prev) => ({ ...prev, links: { ...prev.links, [field]: value } }))
  }

  function addTag(value: string) {
    const trimmed = value.trim()
    if (!trimmed) return
    setDraft((prev) => (prev.tags.includes(trimmed) ? prev : { ...prev, tags: [...prev.tags, trimmed] }))
  }

  function removeTag(tag: string) {
    setDraft((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }))
  }

  function handleCopy() {
    navigator.clipboard.writeText(json).then(
      () => {
        setCopyStatus('copied')
        setTimeout(() => setCopyStatus('idle'), 2000)
      },
      () => setCopyStatus('error'),
    )
  }

  function handleDownload() {
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${draft.slug.trim() || 'project'}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={styles.layout}>
      <div className={styles.formColumn}>
        <Panel className={styles.formPanel}>
          <h2 className={showcaseStyles.sidebarHeading}>Import Existing JSON</h2>
          <p className={styles.hint}>Editing an existing project? Paste its JSON below (or choose the file) to load it into the form.</p>
          <textarea
            className={styles.textarea}
            rows={4}
            placeholder="Paste an existing data/showcase/*.json file here..."
            value={importText}
            onChange={(e) => {
              setImportText(e.target.value)
              setImportError(null)
            }}
          />
          <div className={styles.actionsRow}>
            <Button variant="secondary" size="sm" onClick={() => handleLoadImport(importText)}>Load JSON</Button>
            <label className={styles.fileButton}>
              Choose file...
              <input type="file" accept="application/json,.json" className={styles.fileInput} onChange={handleImportFile} />
            </label>
          </div>
          {importError && <p className={styles.missingHint}>{importError}</p>}
        </Panel>

        <Panel className={styles.formPanel}>
          <h2 className={showcaseStyles.sidebarHeading}>Basics</h2>
          <Field label="Title">
            <input className={styles.input} value={draft.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="My Awesome Datapack" />
          </Field>
          <Field label="Slug" hint="Used in the URL: /showcase/<slug>. Auto-filled from the title.">
            <input className={styles.input} value={draft.slug} onChange={(e) => handleSlugChange(e.target.value)} placeholder="my-awesome-datapack" />
          </Field>
          <Field label="Tagline">
            <input
              className={styles.input}
              value={draft.tagline}
              onChange={(e) => setDraft((prev) => ({ ...prev, tagline: e.target.value }))}
              placeholder="One sentence describing the project"
            />
          </Field>
          <Field label="Trailer / video embed URL" hint="Optional. Must be an embeddable URL, e.g. a YouTube embed link.">
            <input
              className={styles.input}
              value={draft.video}
              onChange={(e) => setDraft((prev) => ({ ...prev, video: e.target.value }))}
              placeholder="https://www.youtube.com/embed/..."
            />
          </Field>
        </Panel>

        <Panel className={styles.formPanel}>
          <h2 className={showcaseStyles.sidebarHeading}>Description</h2>
          <p className={styles.hint}>One box per paragraph. Markdown is supported: **bold**, *italic*, [links](url), ## headings.</p>
          {draft.description.map((paragraph, idx) => (
            <div key={idx} className={styles.repeatRow}>
              <textarea className={styles.textarea} value={paragraph} onChange={(e) => handleDescriptionChange(idx, e.target.value)} rows={3} />
              {draft.description.length > 1 && (
                <button type="button" className={styles.removeButton} onClick={() => removeDescriptionParagraph(idx)} aria-label="Remove paragraph">
                  ×
                </button>
              )}
            </div>
          ))}
          <Button variant="secondary" size="sm" onClick={addDescriptionParagraph}>+ Add paragraph</Button>
        </Panel>

        <Panel className={styles.formPanel}>
          <h2 className={showcaseStyles.sidebarHeading}>Images</h2>
          <p className={styles.hint}>Type the filename you'll send alongside the JSON (e.g. castle.webp) — don't upload anything here.</p>
          {draft.images.map((image, idx) => (
            <div key={idx} className={styles.imageRow}>
              <input className={styles.input} placeholder="filename.webp" value={image.filename} onChange={(e) => handleImageChange(idx, 'filename', e.target.value)} />
              <input className={styles.input} placeholder="Alt text" value={image.alt} onChange={(e) => handleImageChange(idx, 'alt', e.target.value)} />
              {draft.images.length > 1 ? (
                <button type="button" className={styles.removeButton} onClick={() => removeImage(idx)} aria-label="Remove image">
                  ×
                </button>
              ) : (
                <span />
              )}
              <span className={styles.pathPreview}>
                /img/showcase/{draft.slug.trim() || '<slug>'}/{image.filename.trim() || '<filename>'}
              </span>
            </div>
          ))}
          <Button variant="secondary" size="sm" onClick={addImage}>+ Add image</Button>
        </Panel>

        <Panel className={styles.formPanel}>
          <h2 className={showcaseStyles.sidebarHeading}>Credits</h2>
          <p className={styles.hint}>Group contributors by role (e.g. "Building &amp; Art"). Minecraft takes a player UUID, used for the head icon.</p>
          {draft.credits.map((group, gi) => (
            <div key={gi} className={styles.groupBox}>
              <div className={styles.row}>
                <input className={styles.input} placeholder="Section name" value={group.section} onChange={(e) => handleGroupSectionChange(gi, e.target.value)} />
                <button type="button" className={styles.removeButton} onClick={() => removeCreditGroup(gi)} aria-label="Remove group">
                  ×
                </button>
              </div>
              {group.members.map((member, mi) => (
                <div key={mi} className={styles.memberBox}>
                  <div className={styles.row}>
                    <input className={styles.input} placeholder="Name" value={member.name} onChange={(e) => handleMemberChange(gi, mi, 'name', e.target.value)} />
                    <input
                      className={styles.input}
                      placeholder="Minecraft UUID (optional)"
                      value={member.minecraft.uuid}
                      onChange={(e) => handleMemberChange(gi, mi, 'minecraft', e.target.value)}
                    />
                    <button type="button" className={styles.removeButton} onClick={() => removeMember(gi, mi)} aria-label="Remove member">
                      ×
                    </button>
                  </div>
                  <input
                    className={styles.input}
                    placeholder="Role (optional, shown on hover)"
                    value={member.role}
                    onChange={(e) => handleMemberChange(gi, mi, 'role', e.target.value)}
                  />
                  {member.socials.map((social, si) => (
                    <div key={si} className={styles.row}>
                      <IconSelect value={social.type} onChange={(type) => handleSocialChange(gi, mi, si, 'type', type)} />
                      <input className={styles.input} placeholder="URL" value={social.url} onChange={(e) => handleSocialChange(gi, mi, si, 'url', e.target.value)} />
                      <button type="button" className={styles.removeButton} onClick={() => removeSocial(gi, mi, si)} aria-label="Remove social link">
                        ×
                      </button>
                    </div>
                  ))}
                  <Button variant="secondary" size="sm" onClick={() => addSocial(gi, mi)}>+ Add social link</Button>
                </div>
              ))}
              <Button variant="secondary" size="sm" onClick={() => addMember(gi)}>+ Add member</Button>
            </div>
          ))}
          <Button variant="secondary" size="sm" onClick={addCreditGroup}>+ Add credit group</Button>
        </Panel>

        <Panel className={styles.formPanel}>
          <h2 className={showcaseStyles.sidebarHeading}>Links</h2>
          <Field label="Source (GitHub)" icon={iconPath('github')}>
            <input className={styles.input} value={draft.links.source} onChange={(e) => handleLinkChange('source', e.target.value)} placeholder="https://github.com/..." />
          </Field>
          <Field label="Website" icon={iconPath('website')}>
            <input className={styles.input} value={draft.links.website} onChange={(e) => handleLinkChange('website', e.target.value)} placeholder="https://..." />
          </Field>
          <Field label="Modrinth" icon={iconPath('modrinth')}>
            <input className={styles.input} value={draft.links.modrinth} onChange={(e) => handleLinkChange('modrinth', e.target.value)} placeholder="https://modrinth.com/..." />
          </Field>
          <Field label="Smithed" icon={iconPath('smithed')}>
            <input className={styles.input} value={draft.links.smithed} onChange={(e) => handleLinkChange('smithed', e.target.value)} placeholder="https://smithed.dev/..." />
          </Field>
          <Field label="Planet Minecraft" icon={iconPath('planetminecraft')}>
            <input
              className={styles.input}
              value={draft.links.planetminecraft}
              onChange={(e) => handleLinkChange('planetminecraft', e.target.value)}
              placeholder="https://www.planetminecraft.com/..."
            />
          </Field>
        </Panel>

        <Panel className={styles.formPanel}>
          <h2 className={showcaseStyles.sidebarHeading}>Tags</h2>
          <div className={showcaseStyles.tagRow}>
            {draft.tags.map((tag) => (
              <span key={tag} className={showcaseStyles.tag} style={{ ['--tag-accent' as string]: `var(${tagAccentVar(tag)})` }}>
                {tag}
                <button type="button" className={styles.tagRemove} onClick={() => removeTag(tag)} aria-label={`Remove tag ${tag}`}>
                  ×
                </button>
              </span>
            ))}
          </div>
          <input
            className={styles.input}
            placeholder="Type a tag and press Enter"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addTag(tagInput)
                setTagInput('')
              }
            }}
          />
        </Panel>
      </div>

      <div className={styles.outputColumn}>
        <Panel className={styles.outputPanel}>
          <h2 className={showcaseStyles.sidebarHeading}>Generated JSON</h2>
          {missing.length > 0 && <p className={styles.missingHint}>Still needed: {missing.join(', ')}</p>}
          <pre className={styles.jsonOutput}>{json}</pre>
          <div className={styles.actionsRow}>
            <Button variant="secondary" size="sm" onClick={handleCopy}>
              {copyStatus === 'copied' ? 'Copied!' : 'Copy JSON'}
            </Button>
            <Button variant="secondary" size="sm" onClick={handleDownload}>Download JSON</Button>
          </div>
          {copyStatus === 'error' && <p className={styles.missingHint}>Couldn't copy automatically — select the text above and copy manually.</p>}
          <p className={styles.hint}>Send this JSON file to a Sandstone maintainer along with the image files listed above, named exactly as shown.</p>
        </Panel>
      </div>
    </div>
  )
}
