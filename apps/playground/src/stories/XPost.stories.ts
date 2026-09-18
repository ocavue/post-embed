import type { Snapshot } from '../snapshots.ts'

import XPost from './XPost.astro'

type Props = {
  snapshot: Snapshot
  remote?: boolean
  dark?: boolean
  narrow?: boolean
}
export default { component: XPost }

export const Debug = { args: { snapshot: 'links' } satisfies Props }

export const Remote = {
  args: { snapshot: 'missing', remote: true } satisfies Props,
}
