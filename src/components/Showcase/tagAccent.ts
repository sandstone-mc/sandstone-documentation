const ACCENT_VARS = ['--grass', '--sandstone', '--diamond', '--redstone', '--gold', '--iron', '--copper']

export function tagAccentVar(tag: string): string {
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash = (hash * 33 + tag.charCodeAt(i)) >>> 0
  }
  return ACCENT_VARS[hash % ACCENT_VARS.length]
}
