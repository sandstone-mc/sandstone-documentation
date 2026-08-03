import type { IconType, PlatformType } from './types'

export function iconPath(type: IconType): string {
  return `/img/icons/socials/${type}.png`
}

interface PlatformMeta {
  label: string
  color: string
}

export const PLATFORM_META: Record<PlatformType, PlatformMeta> = {
  modrinth: { label: 'Modrinth', color: '#16181C' },
  smithed: { label: 'Smithed', color: '#1539b0' },
  planetminecraft: { label: 'Planet Minecraft', color: '#a66c2e' },
}
