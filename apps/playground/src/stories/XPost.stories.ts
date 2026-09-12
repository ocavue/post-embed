import type { Snapshot } from '../snapshots.ts'

import XPost from './XPost.astro'

type Props = {
  snapshot: Snapshot
  remote?: boolean
  dark?: boolean
  narrow?: boolean
}
export default { component: XPost }

export const PlainText = { args: { snapshot: 'plain' } satisfies Props }
export const LinksAndEmoji = { args: { snapshot: 'links' } satisfies Props }
export const LongText = { args: { snapshot: 'long' } satisfies Props }
export const RightToLeft = { args: { snapshot: 'rtl' } satisfies Props }
export const EmptyText = { args: { snapshot: 'empty' } satisfies Props }
export const MissingData = { args: { snapshot: 'missing' } satisfies Props }
export const InvalidData = { args: { snapshot: 'invalid' } satisfies Props }
export const DarkTheme = {
  args: { snapshot: 'links', dark: true } satisfies Props,
}
export const Narrow = {
  args: { snapshot: 'long', narrow: true } satisfies Props,
}

export const Photo = { args: { snapshot: 'photo' } satisfies Props }
export const TwoPhotos = { args: { snapshot: 'two-photos' } satisfies Props }
export const ThreePhotos = {
  args: { snapshot: 'three-photos' } satisfies Props,
}
export const FourPhotos = { args: { snapshot: 'four-photos' } satisfies Props }
export const Video = { args: { snapshot: 'video' } satisfies Props }
export const Gif = { args: { snapshot: 'gif' } satisfies Props }
export const MixedMedia = { args: { snapshot: 'mixed-media' } satisfies Props }
export const Unavailable = { args: { snapshot: 'unavailable' } satisfies Props }
export const BrokenMedia = {
  args: { snapshot: 'broken-media' } satisfies Props,
}
export const Quote = { args: { snapshot: 'quote' } satisfies Props }
export const Reply = { args: { snapshot: 'reply' } satisfies Props }
export const Verified = { args: { snapshot: 'verified' } satisfies Props }
export const Edited = { args: { snapshot: 'edited' } satisfies Props }
export const StaleEdit = { args: { snapshot: 'stale-edit' } satisfies Props }
export const Truncated = { args: { snapshot: 'truncated' } satisfies Props }

export const Remote = {
  args: { snapshot: 'missing', remote: true } satisfies Props,
}
