import type { Snapshot } from '../snapshots.ts'

import XPost from './XPost.astro'

type Props = { snapshot: Snapshot; dark?: boolean; narrow?: boolean }
export default { component: XPost }

export const PlainText = { args: { snapshot: 'plain' } satisfies Props }
export const LinksAndEmoji = { args: { snapshot: 'links' } satisfies Props }
export const LongText = { args: { snapshot: 'long' } satisfies Props }
export const RightToLeft = { args: { snapshot: 'rtl' } satisfies Props }
export const EncodedText = { args: { snapshot: 'encoded' } satisfies Props }
export const EmptyText = { args: { snapshot: 'empty' } satisfies Props }
export const MissingData = { args: { snapshot: 'missing' } satisfies Props }
export const InvalidData = { args: { snapshot: 'invalid' } satisfies Props }
export const DarkTheme = {
  args: { snapshot: 'links', dark: true } satisfies Props,
}
export const Narrow = {
  args: { snapshot: 'long', narrow: true } satisfies Props,
}
