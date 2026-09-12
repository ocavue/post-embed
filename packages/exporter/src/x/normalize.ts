import { TweetSchema } from '@post-embed/schema'
import type { Tweet } from '@post-embed/types'
import type {
  Indices,
  TweetEntities,
} from '@post-embed/types/internal/tweet/entities'
import type {
  MediaDetails,
  VideoInfo,
} from '@post-embed/types/internal/tweet/media'
import type { TweetPhoto } from '@post-embed/types/internal/tweet/photo'
import type {
  QuotedTweet,
  TweetBase,
} from '@post-embed/types/internal/tweet/tweet'
import type { TweetUser } from '@post-embed/types/internal/tweet/user'
import type { TweetVideo } from '@post-embed/types/internal/tweet/video'

import type {
  GraphQLEditControl,
  GraphQLEntities,
  GraphQLMedia,
  GraphQLTweet,
  GraphQLUser,
} from './graphql.ts'

export interface XTweetCapture {
  tweet: Tweet
  /**
   * The author limits who can see their posts; the data came from a session that could.
   */
  protected: boolean
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/**
 * A `tweet_results.result` value, with the visibility wrapper removed.
 */
export function unwrapTweetResult(result: unknown): GraphQLTweet | undefined {
  if (!isRecord(result)) return undefined
  if (result['__typename'] === 'TweetWithVisibilityResults') {
    return unwrapTweetResult(result['tweet'])
  }
  if (
    result['__typename'] === 'Tweet' &&
    typeof result['rest_id'] === 'string' &&
    isRecord(result['legacy']) &&
    isRecord(result['core'])
  ) {
    return result as unknown as GraphQLTweet
  }
  return undefined
}

function unwrapUser(
  results: GraphQLTweet['core']['user_results'],
): GraphQLUser | undefined {
  const user = results?.result
  if (!user || user.__typename === 'UserUnavailable') return undefined
  return typeof user.rest_id === 'string' ? user : undefined
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

function toIndices(
  indices: number[] | undefined,
  fallback: Indices = [0, 0],
): Indices {
  const [start, end] = indices ?? []
  return start !== undefined && end !== undefined ? [start, end] : fallback
}

function codePointLength(text: string): number {
  return Array.from(text).length
}

function toEntities(
  entities: GraphQLEntities | undefined,
  media: GraphQLMedia[],
  mediaIndices: Indices | undefined,
): TweetEntities {
  return {
    hashtags: (entities?.hashtags ?? []).map((item) => ({
      indices: toIndices(item.indices),
      text: item.text ?? '',
    })),
    urls: (entities?.urls ?? []).map((item) => ({
      display_url: item.display_url ?? '',
      expanded_url: item.expanded_url ?? '',
      indices: toIndices(item.indices),
      url: item.url ?? '',
    })),
    user_mentions: (entities?.user_mentions ?? []).map((item) => ({
      id_str: item.id_str ?? '',
      indices: toIndices(item.indices),
      name: item.name ?? '',
      screen_name: item.screen_name ?? '',
    })),
    symbols: (entities?.symbols ?? []).map((item) => ({
      indices: toIndices(item.indices),
      text: item.text ?? '',
    })),
    media: media.map((item) => ({
      display_url: item.display_url ?? '',
      expanded_url: item.expanded_url ?? '',
      indices: mediaIndices ?? toIndices(item.indices),
      url: item.url ?? '',
    })),
  }
}

function toVideoInfo(info: GraphQLMedia['video_info']): VideoInfo {
  const [width, height] = info?.aspect_ratio ?? []
  return {
    aspect_ratio:
      width !== undefined && height !== undefined ? [width, height] : [1, 1],
    variants: (info?.variants ?? []).map((variant) => ({
      bitrate: variant.bitrate,
      content_type:
        variant.content_type === 'application/x-mpegURL'
          ? 'application/x-mpegURL'
          : 'video/mp4',
      url: variant.url ?? '',
    })),
  }
}

function toMediaDetails(media: GraphQLMedia, indices: Indices): MediaDetails {
  const size = { h: 0, w: 0, resize: 'fit' }
  const base = {
    display_url: media.display_url ?? '',
    expanded_url: media.expanded_url ?? '',
    ext_media_availability: {
      status: media.ext_media_availability?.status ?? 'Available',
    },
    ext_media_color: { palette: [] },
    indices,
    media_url_https: media.media_url_https ?? '',
    original_info: {
      height: media.original_info?.height ?? 0,
      width: media.original_info?.width ?? 0,
      focus_rects: media.original_info?.focus_rects ?? [],
    },
    sizes: media.sizes ?? {
      large: size,
      medium: size,
      small: size,
      thumb: size,
    },
    url: media.url ?? '',
  }
  if (media.type === 'video' || media.type === 'animated_gif') {
    return {
      ...base,
      type: media.type,
      video_info: toVideoInfo(media.video_info),
    }
  }
  return { ...base, type: 'photo', ext_alt_text: media.ext_alt_text }
}

function toUser(user: GraphQLUser): TweetUser {
  const label = user.affiliates_highlighted_label?.label
  const verifiedType =
    user.verification?.verified_type ?? user.legacy?.verified_type
  const shape = user.profile_image_shape
  return {
    id_str: user.rest_id,
    name: user.core?.name ?? user.legacy?.name ?? '',
    screen_name: user.core?.screen_name ?? user.legacy?.screen_name ?? '',
    profile_image_url_https:
      user.avatar?.image_url ?? user.legacy?.profile_image_url_https ?? '',
    profile_image_shape:
      shape === 'Square' || shape === 'Hexagon' ? shape : 'Circle',
    verified: user.verification?.verified ?? user.legacy?.verified ?? false,
    verified_type:
      verifiedType === 'Business' || verifiedType === 'Government'
        ? verifiedType
        : undefined,
    is_blue_verified: user.is_blue_verified ?? false,
    highlighted_label: label?.badge?.url
      ? {
          description: label.description,
          badge: { url: label.badge.url },
          url: label.url?.url
            ? { url: label.url.url, url_type: 'DeepLink' }
            : undefined,
          user_label_type: 'BusinessLabel',
          user_label_display_type: 'Badge',
        }
      : undefined,
  }
}

function toEditControl(
  control: GraphQLEditControl | undefined,
  restId: string,
) {
  const initial = control?.edit_control_initial ?? control
  const editTweetIds = initial?.edit_tweet_ids?.length
    ? initial.edit_tweet_ids
    : [restId]
  return {
    edit_control: {
      edit_tweet_ids: editTweetIds,
      editable_until_msecs: initial?.editable_until_msecs ?? '0',
      is_edit_eligible: initial?.is_edit_eligible ?? false,
      edits_remaining: initial?.edits_remaining ?? '0',
    },
    isEdited: editTweetIds.length > 1,
    isStaleEdit:
      editTweetIds.length > 1 &&
      editTweetIds[editTweetIds.length - 1] !== restId,
  }
}

interface BaseResult {
  base: TweetBase
  media: GraphQLMedia[]
  mediaDetails: MediaDetails[]
}

/**
 * Fields shared by a top-level tweet and a quoted tweet. A long post's full
 * text replaces the truncated `full_text`; its media indices then move to the
 * end of the text, because `enrichTweet` cuts the visible text at the first
 * media entity.
 */
function toTweetBase(result: GraphQLTweet, user: GraphQLUser): BaseResult {
  const legacy = result.legacy
  const note = result.note_tweet?.note_tweet_results?.result
  const text = note?.text ?? legacy.full_text ?? ''
  const media = legacy.extended_entities?.media ?? legacy.entities?.media ?? []
  const textLength = codePointLength(text)
  const mediaIndices: Indices | undefined = note
    ? [textLength, textLength]
    : undefined
  const mediaDetails = media.map((item) => {
    return toMediaDetails(item, mediaIndices ?? toIndices(item.indices))
  })
  return {
    base: {
      lang: legacy.lang ?? '',
      created_at: toISODate(legacy.created_at),
      display_text_range: note
        ? [0, textLength]
        : toIndices(legacy.display_text_range, [0, textLength]),
      entities: toEntities(
        note ? note.entity_set : legacy.entities,
        media,
        mediaIndices,
      ),
      id_str: result.rest_id,
      text,
      user: toUser(user),
      ...toEditControl(result.edit_control, result.rest_id),
    },
    media,
    mediaDetails,
  }
}

function toPhotos(mediaDetails: MediaDetails[]): TweetPhoto[] {
  return mediaDetails
    .filter((item) => item.type === 'photo')
    .map((item) => ({
      backgroundColor: { red: 0, green: 0, blue: 0 },
      cropCandidates: [],
      expandedUrl: item.expanded_url,
      url: item.media_url_https,
      width: item.original_info.width,
      height: item.original_info.height,
    }))
}

function toVideo(
  media: GraphQLMedia[],
  mediaDetails: MediaDetails[],
): TweetVideo | undefined {
  const index = mediaDetails.findIndex((item) => item.type !== 'photo')
  const detail = mediaDetails[index]
  const raw = media[index]
  if (!detail || detail.type === 'photo' || !raw) return undefined
  return {
    aspectRatio: detail.video_info.aspect_ratio,
    contentType:
      detail.type === 'animated_gif' ? 'animated_gif' : 'media_entity',
    durationMs: raw.video_info?.duration_millis ?? 0,
    mediaAvailability: { status: detail.ext_media_availability.status },
    poster: detail.media_url_https,
    variants: detail.video_info.variants.map((variant) => ({
      type: variant.content_type,
      src: variant.url,
    })),
    videoId: { type: 'video', id: raw.media_key ?? raw.id_str ?? '' },
    viewCount: raw.mediaStats?.viewCount ?? 0,
  }
}

function toQuotedTweet(result: unknown): QuotedTweet | undefined {
  const quoted = unwrapTweetResult(result)
  if (!quoted) return undefined
  const user = unwrapUser(quoted.core.user_results)
  if (!user) return undefined
  const { base, mediaDetails } = toTweetBase(quoted, user)
  return {
    ...base,
    reply_count: quoted.legacy.reply_count ?? 0,
    retweet_count: quoted.legacy.retweet_count ?? 0,
    favorite_count: quoted.legacy.favorite_count ?? 0,
    mediaDetails,
    self_thread: {
      id_str: quoted.legacy.conversation_id_str ?? quoted.rest_id,
    },
  }
}

/**
 * Convert one GraphQL tweet into the syndication-shaped `Tweet` that
 * `@post-embed/elements` renders. Returns `undefined` when the author is
 * unavailable or the result fails `TweetSchema`.
 */
export function toTweet(result: GraphQLTweet): XTweetCapture | undefined {
  const user = unwrapUser(result.core.user_results)
  if (!user) return undefined
  const { base, media, mediaDetails } = toTweetBase(result, user)
  const legacy = result.legacy
  const candidate: Tweet = {
    ...base,
    __typename: 'Tweet',
    favorite_count: legacy.favorite_count ?? 0,
    mediaDetails,
    photos: toPhotos(mediaDetails),
    video: toVideo(media, mediaDetails),
    conversation_count: legacy.reply_count ?? 0,
    news_action_type: 'conversation',
    quoted_tweet: toQuotedTweet(result.quoted_status_result?.result),
    in_reply_to_screen_name: legacy.in_reply_to_screen_name,
    in_reply_to_status_id_str: legacy.in_reply_to_status_id_str,
    in_reply_to_user_id_str: legacy.in_reply_to_user_id_str,
    possibly_sensitive: legacy.possibly_sensitive,
  }
  const validated = TweetSchema['~standard'].validate(candidate)
  if (validated instanceof Promise || validated.issues) return undefined
  return {
    tweet: validated.value,
    protected: user.privacy?.protected ?? user.legacy?.protected ?? false,
  }
}
