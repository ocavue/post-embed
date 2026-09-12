import { TweetSchema } from '@post-embed/schema'
import type {
  Tweet,
  XPost,
  XPostAuthor,
  XPostBase,
  XPostMedia,
  XPostVideoSource,
} from '@post-embed/types'
import type { MediaDetails } from '@post-embed/types/internal/tweet/media'
import type { TweetPhoto } from '@post-embed/types/internal/tweet/photo'
import type { QuotedTweet } from '@post-embed/types/internal/tweet/tweet'
import type { TweetUser } from '@post-embed/types/internal/tweet/user'
import type { TweetVideo } from '@post-embed/types/internal/tweet/video'
import { decodeHTML } from 'entities'
import * as v from 'valibot'

import { toSegments } from './segments.ts'

/**
 * A syndication API response (or an older saved snapshot) to `XPost`.
 * Returns `undefined` for anything that is not a tweet, such as a tombstone.
 */
export function fromSyndication(input: unknown): XPost | undefined {
  const parsed = v.safeParse(TweetSchema, input)
  return parsed.success ? fromSyndicationTweet(parsed.output) : undefined
}

export function fromSyndicationTweet(tweet: Tweet): XPost {
  const post: XPost = toBase(tweet)
  if (tweet.quoted_tweet) post.quote = toBase(tweet.quoted_tweet)
  if (tweet.in_reply_to_screen_name && tweet.in_reply_to_status_id_str) {
    post.replyTo = {
      handle: tweet.in_reply_to_screen_name,
      id: tweet.in_reply_to_status_id_str,
    }
  }
  return post
}

function toBase(tweet: Tweet | QuotedTweet): XPostBase {
  const post: XPostBase = {
    id: tweet.id_str,
    createdAt: tweet.created_at,
    author: toAuthor(tweet.user),
    body: toSegments(tweet.text, tweet.display_text_range, tweet.entities),
  }
  if (tweet.lang) post.lang = tweet.lang
  const media = toMedia(tweet)
  if (media.length > 0) post.media = media
  if (tweet.isStaleEdit) post.edit = 'stale'
  else if (tweet.isEdited) post.edit = 'edited'
  if (tweet.note_tweet) post.truncated = true
  return post
}

function toAuthor(user: TweetUser): XPostAuthor {
  const author: XPostAuthor = {
    name: decodeHTML(user.name),
    handle: user.screen_name,
  }
  if (user.profile_image_url_https) author.avatar = user.profile_image_url_https
  if (user.profile_image_shape === 'Square') author.avatarShape = 'square'
  if (user.profile_image_shape === 'Hexagon') author.avatarShape = 'hexagon'
  if (user.verified_type === 'Business') author.verified = 'business'
  else if (user.verified_type === 'Government') author.verified = 'government'
  else if (user.is_blue_verified) author.verified = 'blue'
  else if (user.verified) author.verified = 'legacy'
  const label = user.highlighted_label
  if (label) {
    author.label = { text: decodeHTML(label.description ?? '') }
    if (label.badge?.url) author.label.badge = label.badge.url
    if (label.url?.url) author.label.url = label.url.url
  }
  return author
}

function isUnavailable(status: string): boolean {
  return Boolean(status) && status.toLowerCase() !== 'available'
}

function toSource(
  url: string,
  type: string,
  bitrate?: number,
): XPostVideoSource | undefined {
  if (type === 'video/mp4') {
    return bitrate === undefined ? { url, type } : { url, type, bitrate }
  }
  if (
    type === 'application/x-mpegURL' ||
    type === 'application/vnd.apple.mpegurl'
  ) {
    return { url, type: 'application/x-mpegURL' }
  }
  return undefined
}

function fromMediaDetails(media: MediaDetails): XPostMedia {
  const unavailable = isUnavailable(media.ext_media_availability.status)
  const width = media.original_info.width
  const height = media.original_info.height
  if (media.type === 'photo') {
    const photo: XPostMedia = {
      type: 'photo',
      url: media.media_url_https,
      width,
      height,
    }
    if (media.ext_alt_text) photo.alt = media.ext_alt_text
    if (unavailable) photo.unavailable = true
    return photo
  }
  const video: XPostMedia = {
    type: media.type === 'animated_gif' ? 'gif' : 'video',
    width,
    height,
    sources: media.video_info.variants.flatMap((variant) => {
      const source = toSource(
        variant.url,
        variant.content_type,
        variant.bitrate,
      )
      return source ? [source] : []
    }),
  }
  if (media.media_url_https) video.poster = media.media_url_https
  if (unavailable) video.unavailable = true
  return video
}

function toMedia(tweet: {
  mediaDetails?: MediaDetails[]
  photos?: TweetPhoto[]
  video?: TweetVideo
}): XPostMedia[] {
  if (tweet.mediaDetails?.length)
    return tweet.mediaDetails.map(fromMediaDetails)
  const media: XPostMedia[] = (tweet.photos ?? []).map((photo) => ({
    type: 'photo',
    url: photo.url,
    width: photo.width,
    height: photo.height,
  }))
  const video = tweet.video
  if (video) {
    const item: XPostMedia = {
      type: video.contentType === 'animated_gif' ? 'gif' : 'video',
      width: video.aspectRatio[0] * 100,
      height: video.aspectRatio[1] * 100,
      sources: video.variants.flatMap((variant) => {
        const source = toSource(variant.src, variant.type)
        return source ? [source] : []
      }),
    }
    if (video.poster) item.poster = video.poster
    if (isUnavailable(video.mediaAvailability.status)) item.unavailable = true
    media.push(item)
  }
  return media
}
