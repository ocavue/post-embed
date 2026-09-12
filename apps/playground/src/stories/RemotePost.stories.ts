import RemotePost from './RemotePost.astro'

type Props = { url?: string }
export default { component: RemotePost }

export const Remote = { args: {} satisfies Props }
