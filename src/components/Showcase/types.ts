export interface ShowcaseImage {
  src: string
  alt: string
}

export type IconType =
  | 'bluesky'
  | 'discord'
  | 'github'
  | 'instagram'
  | 'kofi'
  | 'mapverse'
  | 'modrinth'
  | 'patreon'
  | 'planetminecraft'
  | 'smithed'
  | 'twitch'
  | 'twitter'
  | 'youtube'

export interface ShowcaseSocial {
  type: IconType
  url: string
}

export interface ShowcaseAuthor {
  name: string
  minecraft?: string // Minecraft account UUID, used to fetch a head icon
  socials?: ShowcaseSocial[]
  role?: string // What they did on the project, shown as a hover tooltip
}

export interface ShowcaseCreditGroup {
  section: string
  members: ShowcaseAuthor[]
}

export type PlatformType = 'modrinth' | 'smithed' | 'planetminecraft'

export interface ShowcaseLinks {
  source?: string
  website?: string
  modrinth?: string
  smithed?: string
  planetminecraft?: string
}

export interface ShowcaseProject {
  slug: string
  title: string
  tagline: string
  credits?: ShowcaseCreditGroup[]
  description: string[]
  images: ShowcaseImage[]
  video?: string | null
  links: ShowcaseLinks
  tags?: string[]
  featured?: boolean
  lastUpdated: string
}
