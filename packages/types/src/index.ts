export type { Tweet } from './tweet/index.js'
export type {
  XPost,
  XPostAuthor,
  XPostBase,
  XPostMedia,
  XPostSegment,
  XPostVideoSource,
} from './x/index.js'
export type { YouTubeVideo } from './youtube/index.js'

export { mapXPostMediaUrls, getXPostMediaUrls } from './x/media.js'
export type { MediaRole, XMediaUrlPolicy } from './x/media.js'
export { parseXPostId } from './x/url.js'
