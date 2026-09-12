/**
 * Everything an X post card renders. A snapshot: values are fixed when saved.
 */
export interface XPost extends XPostBase {
  quote?: XPostBase
  /**
   * The post this one replies to. Its link is `https://x.com/<handle>/status/<id>`.
   */
  replyTo?: { handle: string; id: string }
}

/**
 * The part a top-level post and a quoted post share.
 */
export interface XPostBase {
  id: string
  /**
   * ISO 8601.
   */
  createdAt: string
  /**
   * BCP 47 language tag of the body.
   */
  lang?: string
  author: XPostAuthor
  /**
   * The body split by entity, with HTML character references decoded and
   * media links removed. Empty for a post without text.
   */
  body: XPostSegment[]
  media?: XPostMedia[]
  /**
   * `edited`: this is the latest version of an edited post. `stale`: this is
   * an earlier version.
   */
  edit?: 'edited' | 'stale'
  /**
   * The source cut the body short; a "Show more" link points at the post.
   */
  truncated?: boolean
}

export interface XPostAuthor {
  name: string
  /**
   * Without the `@`. The permalink and the profile link derive from it.
   */
  handle: string
  avatar?: string
  /**
   * Circle when absent.
   */
  avatarShape?: 'square' | 'hexagon'
  verified?: 'blue' | 'business' | 'government' | 'legacy'
  /**
   * An affiliation badge next to the name.
   */
  label?: { text: string; badge?: string; url?: string }
}

export type XPostSegment =
  { type: 'text'; text: string } | { type: 'link'; text: string; url: string }

export type XPostMedia =
  | {
      type: 'photo'
      url: string
      width: number
      height: number
      alt?: string
      unavailable?: boolean
    }
  | {
      type: 'video' | 'gif'
      poster?: string
      width: number
      height: number
      sources: XPostVideoSource[]
      unavailable?: boolean
    }

export interface XPostVideoSource {
  url: string
  type: 'video/mp4' | 'application/x-mpegURL'
  bitrate?: number
}
