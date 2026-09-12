import * as v from 'valibot'

/**
 * The subset of X's GraphQL tweet shape that the exporter reads. Everything
 * but the fields used to recognize a tweet is optional: responses drift, and
 * a missing field must degrade to a schema fallback, never to a crash.
 * Objects are loose so a parsed result still carries every unknown field.
 */

const indices = v.optional(v.array(v.number()))
const text = v.optional(v.string())

const SizeSchema = v.object({
  h: v.number(),
  w: v.number(),
  resize: v.string(),
})

const UrlEntitySchema = v.looseObject({
  display_url: text,
  expanded_url: text,
  indices,
  url: text,
})

export const GraphQLMediaSchema = v.looseObject({
  type: v.optional(v.picklist(['photo', 'video', 'animated_gif'])),
  id_str: text,
  media_key: text,
  display_url: text,
  expanded_url: text,
  indices,
  media_url_https: text,
  url: text,
  ext_alt_text: text,
  ext_media_availability: v.optional(v.looseObject({ status: text })),
  original_info: v.optional(
    v.looseObject({
      height: v.optional(v.number()),
      width: v.optional(v.number()),
      focus_rects: v.optional(
        v.array(
          v.object({
            x: v.number(),
            y: v.number(),
            w: v.number(),
            h: v.number(),
          }),
        ),
      ),
    }),
  ),
  sizes: v.optional(
    v.object({
      large: SizeSchema,
      medium: SizeSchema,
      small: SizeSchema,
      thumb: SizeSchema,
    }),
  ),
  video_info: v.optional(
    v.looseObject({
      aspect_ratio: v.optional(v.array(v.number())),
      duration_millis: v.optional(v.number()),
      variants: v.optional(
        v.array(
          v.looseObject({
            bitrate: v.optional(v.number()),
            content_type: text,
            url: text,
          }),
        ),
      ),
    }),
  ),
  mediaStats: v.optional(v.looseObject({ viewCount: v.optional(v.number()) })),
})

export const GraphQLEntitiesSchema = v.looseObject({
  hashtags: v.optional(v.array(v.looseObject({ indices, text }))),
  urls: v.optional(v.array(UrlEntitySchema)),
  user_mentions: v.optional(
    v.array(
      v.looseObject({ id_str: text, indices, name: text, screen_name: text }),
    ),
  ),
  symbols: v.optional(v.array(v.looseObject({ indices, text }))),
  media: v.optional(v.array(GraphQLMediaSchema)),
})

export const GraphQLHighlightedLabelSchema = v.looseObject({
  description: text,
  badge: v.optional(v.looseObject({ url: text })),
  url: v.optional(v.looseObject({ url: text, urlType: text })),
  userLabelType: text,
  userLabelDisplayType: text,
})

export const GraphQLUserSchema = v.looseObject({
  __typename: v.optional(v.literal('User')),
  rest_id: v.string(),
  is_blue_verified: v.optional(v.boolean()),
  profile_image_shape: text,
  core: v.optional(v.looseObject({ name: text, screen_name: text })),
  avatar: v.optional(v.looseObject({ image_url: text })),
  verification: v.optional(
    v.looseObject({ verified: v.optional(v.boolean()), verified_type: text }),
  ),
  privacy: v.optional(v.looseObject({ protected: v.optional(v.boolean()) })),
  affiliates_highlighted_label: v.optional(
    v.looseObject({ label: v.optional(GraphQLHighlightedLabelSchema) }),
  ),
  /**
   * Dropped by X in July 2026; kept for responses that still carry it.
   */
  legacy: v.optional(
    v.looseObject({
      name: text,
      screen_name: text,
      profile_image_url_https: text,
      verified: v.optional(v.boolean()),
      verified_type: text,
      protected: v.optional(v.boolean()),
    }),
  ),
})

const EditControlFieldsSchema = v.looseObject({
  edit_tweet_ids: v.optional(v.array(v.string())),
  editable_until_msecs: text,
  is_edit_eligible: v.optional(v.boolean()),
  edits_remaining: text,
})

export const GraphQLEditControlSchema = v.looseObject({
  ...EditControlFieldsSchema.entries,
  initial_tweet_id: text,
  edit_control_initial: v.optional(EditControlFieldsSchema),
})

export const GraphQLTweetLegacySchema = v.looseObject({
  created_at: text,
  conversation_id_str: text,
  display_text_range: indices,
  entities: v.optional(GraphQLEntitiesSchema),
  extended_entities: v.optional(
    v.looseObject({ media: v.optional(v.array(GraphQLMediaSchema)) }),
  ),
  favorite_count: v.optional(v.number()),
  full_text: text,
  in_reply_to_screen_name: text,
  in_reply_to_status_id_str: text,
  in_reply_to_user_id_str: text,
  lang: text,
  possibly_sensitive: v.optional(v.boolean()),
  reply_count: v.optional(v.number()),
  retweet_count: v.optional(v.number()),
  retweeted_status_result: v.optional(
    v.looseObject({ result: v.optional(v.unknown()) }),
  ),
})

export const GraphQLTweetSchema = v.looseObject({
  __typename: v.literal('Tweet'),
  rest_id: v.string(),
  core: v.looseObject({
    user_results: v.optional(
      v.looseObject({ result: v.optional(v.unknown()) }),
    ),
  }),
  legacy: GraphQLTweetLegacySchema,
  edit_control: v.optional(GraphQLEditControlSchema),
  note_tweet: v.optional(
    v.looseObject({
      note_tweet_results: v.optional(
        v.looseObject({
          result: v.optional(
            v.looseObject({
              id: text,
              text,
              entity_set: v.optional(GraphQLEntitiesSchema),
            }),
          ),
        }),
      ),
    }),
  ),
  quoted_status_result: v.optional(
    v.looseObject({ result: v.optional(v.unknown()) }),
  ),
})

/**
 * A `tweet_results.result` value: a tweet, or a tweet behind a visibility wrapper.
 */
export const GraphQLTweetResultSchema = v.variant('__typename', [
  v.looseObject({
    __typename: v.literal('TweetWithVisibilityResults'),
    tweet: v.unknown(),
  }),
  GraphQLTweetSchema,
])

export type GraphQLMedia = v.InferOutput<typeof GraphQLMediaSchema>
export type GraphQLEntities = v.InferOutput<typeof GraphQLEntitiesSchema>
export type GraphQLUser = v.InferOutput<typeof GraphQLUserSchema>
export type GraphQLEditControl = v.InferOutput<typeof GraphQLEditControlSchema>
export type GraphQLTweet = v.InferOutput<typeof GraphQLTweetSchema>
