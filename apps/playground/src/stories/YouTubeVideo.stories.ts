import type { YouTubeSnapshot } from '../youtube-snapshots.ts'

import YouTubeVideo from './YouTubeVideo.astro'

type Props = {
  snapshot: YouTubeSnapshot
  inline?: boolean
  remote?: boolean
  dark?: boolean
  narrow?: boolean
}
export default { component: YouTubeVideo }

export const Basic = { args: { snapshot: 'basic' } satisfies Props }
export const LongTitle = { args: { snapshot: 'long-title' } satisfies Props }
export const Short = { args: { snapshot: 'short' } satisfies Props }
export const StartTime = { args: { snapshot: 'start-time' } satisfies Props }
export const NoAuthor = { args: { snapshot: 'no-author' } satisfies Props }
export const Inline = {
  args: { snapshot: 'basic', inline: true } satisfies Props,
}
export const DarkTheme = {
  args: { snapshot: 'basic', dark: true } satisfies Props,
}
export const Narrow = {
  args: { snapshot: 'basic', narrow: true } satisfies Props,
}
export const MissingData = { args: { snapshot: 'missing' } satisfies Props }
export const InvalidData = { args: { snapshot: 'invalid' } satisfies Props }
export const Remote = {
  args: { snapshot: 'missing', remote: true } satisfies Props,
}
