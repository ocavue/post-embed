/**
 * The subset of X's GraphQL tweet shape that the exporter reads. Everything
 * but the fields used to recognize a tweet is optional: responses drift, and
 * a missing field must degrade to a schema fallback, never to a crash.
 */

export interface GraphQLIndexed {
  indices?: number[]
}

export interface GraphQLUrlEntity extends GraphQLIndexed {
  display_url?: string
  expanded_url?: string
  url?: string
}

export interface GraphQLEntities {
  hashtags?: (GraphQLIndexed & { text?: string })[]
  urls?: GraphQLUrlEntity[]
  user_mentions?: (GraphQLIndexed & {
    id_str?: string
    name?: string
    screen_name?: string
  })[]
  symbols?: (GraphQLIndexed & { text?: string })[]
  media?: GraphQLMedia[]
}

export interface GraphQLVideoVariant {
  bitrate?: number
  content_type?: string
  url?: string
}

export interface GraphQLMedia extends GraphQLIndexed {
  type?: 'photo' | 'video' | 'animated_gif'
  id_str?: string
  media_key?: string
  display_url?: string
  expanded_url?: string
  media_url_https?: string
  url?: string
  ext_alt_text?: string
  ext_media_availability?: { status?: string }
  original_info?: {
    height?: number
    width?: number
    focus_rects?: { x: number; y: number; w: number; h: number }[]
  }
  sizes?: Record<
    'large' | 'medium' | 'small' | 'thumb',
    { h: number; w: number; resize: string }
  >
  video_info?: {
    aspect_ratio?: number[]
    duration_millis?: number
    variants?: GraphQLVideoVariant[]
  }
  mediaStats?: { viewCount?: number }
}

export interface GraphQLHighlightedLabel {
  description?: string
  badge?: { url?: string }
  url?: { url?: string; urlType?: string }
  userLabelType?: string
  userLabelDisplayType?: string
}

export interface GraphQLUser {
  __typename?: 'User'
  rest_id: string
  is_blue_verified?: boolean
  profile_image_shape?: string
  core?: { name?: string; screen_name?: string }
  avatar?: { image_url?: string }
  verification?: { verified?: boolean; verified_type?: string }
  privacy?: { protected?: boolean }
  affiliates_highlighted_label?: { label?: GraphQLHighlightedLabel }
  /**
   * Dropped by X in July 2026; kept for responses that still carry it.
   */
  legacy?: {
    name?: string
    screen_name?: string
    profile_image_url_https?: string
    verified?: boolean
    verified_type?: string
    protected?: boolean
  }
}

export interface GraphQLEditControl {
  edit_tweet_ids?: string[]
  editable_until_msecs?: string
  is_edit_eligible?: boolean
  edits_remaining?: string
  initial_tweet_id?: string
  edit_control_initial?: GraphQLEditControl
}

export interface GraphQLTweetLegacy {
  created_at?: string
  conversation_id_str?: string
  display_text_range?: number[]
  entities?: GraphQLEntities
  extended_entities?: { media?: GraphQLMedia[] }
  favorite_count?: number
  full_text?: string
  in_reply_to_screen_name?: string
  in_reply_to_status_id_str?: string
  in_reply_to_user_id_str?: string
  lang?: string
  possibly_sensitive?: boolean
  reply_count?: number
  retweet_count?: number
  retweeted_status_result?: { result?: unknown }
}

export interface GraphQLTweet {
  __typename: 'Tweet'
  rest_id: string
  core: {
    user_results?: {
      result?: GraphQLUser | { __typename: 'UserUnavailable' }
    }
  }
  legacy: GraphQLTweetLegacy
  edit_control?: GraphQLEditControl
  note_tweet?: {
    note_tweet_results?: {
      result?: { id?: string; text?: string; entity_set?: GraphQLEntities }
    }
  }
  quoted_status_result?: { result?: unknown }
}
