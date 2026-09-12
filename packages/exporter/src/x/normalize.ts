import { XPostSchema } from '@post-embed/schema'
import type {
  XPost,
  XPostAuthor,
  XPostBase,
  XPostMedia,
  XPostVideoSource,
} from '@post-embed/types'
import { decodeHTML } from 'entities'
import * as v from 'valibot'

import {
  GraphQLTweetResultSchema,
  GraphQLUserSchema,
  type GraphQLMedia,
  type GraphQLTweet,
  type GraphQLUser,
} from './graphql.ts'
import { toSegments } from './segments.ts'

export interface XPostCapture {
  post: XPost
  /**
   * The author limits who can see their posts; the data came from a session that could.
   */
  protected: boolean
}

/**
 * A `tweet_results.result` value, with the visibility wrapper removed.
 * Anything that is not a tweet (a tombstone, a cursor, a timeline entry)
 * fails the schema and yields `undefined`.
 */
export function unwrapTweetResult(result: unknown): GraphQLTweet | undefined {
  const parsed = v.safeParse(GraphQLTweetResultSchema, result, {
    abortEarly: true,
  })
  if (!parsed.success) return undefined
  return parsed.output.__typename === 'TweetWithVisibilityResults'
    ? unwrapTweetResult(parsed.output.tweet)
    : parsed.output
}

/**
 * The author, or `undefined` for `UserUnavailable` and other non-user results.
 */
function unwrapUser(result: unknown): GraphQLUser | undefined {
  const parsed = v.safeParse(GraphQLUserSchema, result, { abortEarly: true })
  return parsed.success ? parsed.output : undefined
}

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]
const LEGACY_DATE =
  /^\w{3} (\w{3}) (\d{1,2}) (\d{2}):(\d{2}):(\d{2}) ([+-])(\d{2})(\d{2}) (\d{4})$/

/**
 * `Wed Oct 10 20:19:24 +0000 2018` to ISO 8601; anything else goes through `Date.parse`.
 */
export function toISODate(value: string | undefined): string {
  if (!value) return ''
  const match = LEGACY_DATE.exec(value)
  if (!match) {
    const time = Date.parse(value)
    return Number.isNaN(time) ? '' : new Date(time).toISOString()
  }
  const [
    ,
    month,
    day,
    hours,
    minutes,
    seconds,
    sign,
    offsetHours,
    offsetMinutes,
    year,
  ] = match
  const monthIndex = MONTHS.indexOf(month ?? '')
  if (monthIndex === -1) return ''
  const utc = Date.UTC(
    Number(year),
    monthIndex,
    Number(day),
    Number(hours),
    Number(minutes),
    Number(seconds),
  )
  const offset =
    (Number(offsetHours) * 60 + Number(offsetMinutes)) * (sign === '-' ? -1 : 1)
  return new Date(utc - offset * 60_000).toISOString()
}

function toAuthor(user: GraphQLUser): XPostAuthor {
  const author: XPostAuthor = {
    name: decodeHTML(user.core?.name ?? user.legacy?.name ?? ''),
    handle: user.core?.screen_name ?? user.legacy?.screen_name ?? '',
  }
  const avatar = user.avatar?.image_url ?? user.legacy?.profile_image_url_https
  if (avatar) author.avatar = avatar
  if (user.profile_image_shape === 'Square') author.avatarShape = 'square'
  if (user.profile_image_shape === 'Hexagon') author.avatarShape = 'hexagon'
  const verifiedType =
    user.verification?.verified_type ?? user.legacy?.verified_type
  if (verifiedType === 'Business') author.verified = 'business'
  else if (verifiedType === 'Government') author.verified = 'government'
  else if (user.is_blue_verified) author.verified = 'blue'
  else if (user.verification?.verified ?? user.legacy?.verified) {
    author.verified = 'legacy'
  }
  const label = user.affiliates_highlighted_label?.label
  if (label?.badge?.url) {
    author.label = {
      text: decodeHTML(label.description ?? ''),
      badge: label.badge.url,
    }
    if (label.url?.url) author.label.url = label.url.url
  }
  return author
}

function toSource(
  variant: NonNullable<
    NonNullable<GraphQLMedia['video_info']>['variants']
  >[number],
): XPostVideoSource | undefined {
  const url = variant.url
  if (!url) return undefined
  if (variant.content_type === 'video/mp4') {
    return variant.bitrate === undefined
      ? { url, type: 'video/mp4' }
      : { url, type: 'video/mp4', bitrate: variant.bitrate }
  }
  if (variant.content_type === 'application/x-mpegURL') {
    return { url, type: 'application/x-mpegURL' }
  }
  return undefined
}

function toMedia(media: GraphQLMedia): XPostMedia {
  const width = media.original_info?.width ?? 0
  const height = media.original_info?.height ?? 0
  const status = media.ext_media_availability?.status
  const unavailable = Boolean(status) && status !== 'Available'
  if (media.type !== 'video' && media.type !== 'animated_gif') {
    const photo: XPostMedia = {
      type: 'photo',
      url: media.media_url_https ?? '',
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
    sources: (media.video_info?.variants ?? []).flatMap((variant) => {
      const source = toSource(variant)
      return source ? [source] : []
    }),
  }
  if (media.media_url_https) video.poster = media.media_url_https
  if (unavailable) video.unavailable = true
  return video
}

function toEdit(result: GraphQLTweet): XPostBase['edit'] {
  const control = result.edit_control
  const ids = (control?.edit_control_initial ?? control)?.edit_tweet_ids ?? []
  if (ids.length <= 1) return undefined
  return ids[ids.length - 1] === result.rest_id ? 'edited' : 'stale'
}

/**
 * Fields shared by a top-level post and a quoted post. A long post's full
 * note text replaces the truncated `full_text`; the note's entities are
 * relative to it and it carries no media link. A note without text leaves
 * the truncated `full_text` in place and marks the post truncated.
 */
function toBase(result: GraphQLTweet, user: GraphQLUser): XPostBase {
  const legacy = result.legacy
  const note = result.note_tweet?.note_tweet_results?.result
  const media = legacy.extended_entities?.media ?? legacy.entities?.media ?? []
  const post: XPostBase = {
    id: result.rest_id,
    createdAt: toISODate(legacy.created_at),
    author: toAuthor(user),
    body: note?.text
      ? toSegments(note.text, undefined, note.entity_set)
      : toSegments(legacy.full_text ?? '', legacy.display_text_range, {
          ...legacy.entities,
          media,
        }),
  }
  if (legacy.lang) post.lang = legacy.lang
  if (media.length > 0) post.media = media.map(toMedia)
  const edit = toEdit(result)
  if (edit) post.edit = edit
  if (note && !note.text) post.truncated = true
  return post
}

/**
 * Convert one GraphQL tweet into the `XPost` that `@post-embed/elements`
 * renders. Returns `undefined` when the author is unavailable or the result
 * fails `XPostSchema`.
 */
export function toXPost(result: GraphQLTweet): XPostCapture | undefined {
  const user = unwrapUser(result.core.user_results?.result)
  if (!user) return undefined
  const candidate: XPost = toBase(result, user)
  const quoted = unwrapTweetResult(result.quoted_status_result?.result)
  const quotedUser = quoted && unwrapUser(quoted.core.user_results?.result)
  if (quoted && quotedUser) candidate.quote = toBase(quoted, quotedUser)
  const legacy = result.legacy
  if (legacy.in_reply_to_screen_name && legacy.in_reply_to_status_id_str) {
    candidate.replyTo = {
      handle: legacy.in_reply_to_screen_name,
      id: legacy.in_reply_to_status_id_str,
    }
  }
  const validated = XPostSchema['~standard'].validate(candidate)
  if (validated instanceof Promise) return undefined
  if (validated.issues) {
    console.error(
      `[post-embed] Post ${result.rest_id} failed XPostSchema:`,
      validated.issues,
    )
    return undefined
  }
  return {
    post: validated.value,
    protected: user.privacy?.protected ?? user.legacy?.protected ?? false,
  }
}
