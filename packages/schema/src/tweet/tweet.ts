// Source: https://github.com/vercel/react-tweet/blob/react-tweet@3.3.1/packages/react-tweet/src/api/types/tweet.ts
// Source: https://github.com/vercel/react-tweet/blob/react-tweet@3.3.1/packages/react-tweet/src/api/types/edit.ts
// Source: https://github.com/vercel/react-tweet/blob/react-tweet@3.3.1/packages/react-tweet/src/utils.ts

import * as v from 'valibot'

import { EntitySchema, TweetEntitiesSchema } from './entities.js'
import {
  MediaDetailsSchema,
  TweetPhotoSchema,
  TweetVideoSchema,
} from './media.js'
import {
  CountSchema,
  IdSchema,
  IndicesSchema,
  TimestampSchema,
} from './primitives.js'
import { TweetUserSchema, UserCoreSchema } from './user.js'

export const CoreSchema = v.object({
  id_str: IdSchema,
  text: v.string(),
  created_at: TimestampSchema,
  user: UserCoreSchema,
})
export const TweetEditControlSchema = v.object({
  edit_tweet_ids: v.array(IdSchema),
  editable_until_msecs: IdSchema,
  is_edit_eligible: v.boolean(),
  edits_remaining: IdSchema,
})
export const TweetBaseSchema = v.object({
  lang: v.string(),
  created_at: TimestampSchema,
  display_text_range: IndicesSchema,
  entities: v.optional(TweetEntitiesSchema),
  id_str: IdSchema,
  text: v.string(),
  user: TweetUserSchema,
  edit_control: TweetEditControlSchema,
  isEdited: v.boolean(),
  isStaleEdit: v.boolean(),
  note_tweet: v.optional(v.object({ id: v.string() })),
})
export const QuotedTweetObjectSchema = v.object({
  ...TweetBaseSchema.entries,
  reply_count: CountSchema,
  retweet_count: CountSchema,
  favorite_count: CountSchema,
  mediaDetails: v.optional(v.array(MediaDetailsSchema)),
  self_thread: v.object({ id_str: IdSchema }),
})
export const QuotedTweetSchema = v.pipe(
  QuotedTweetObjectSchema,
  v.forward(
    v.check(
      (tweet) => tweet.display_text_range[1] <= Array.from(tweet.text).length,
      'Range exceeds text length',
    ),
    ['display_text_range'],
  ),
)
export const TweetParentObjectSchema = v.object({
  ...TweetBaseSchema.entries,
  reply_count: CountSchema,
  retweet_count: CountSchema,
  favorite_count: CountSchema,
})
export const TweetParentSchema = v.pipe(
  TweetParentObjectSchema,
  v.forward(
    v.check(
      (tweet) => tweet.display_text_range[1] <= Array.from(tweet.text).length,
      'Range exceeds text length',
    ),
    ['display_text_range'],
  ),
)
export const TweetObjectSchema = v.object({
  ...TweetBaseSchema.entries,
  __typename: v.literal('Tweet'),
  favorite_count: CountSchema,
  mediaDetails: v.optional(v.array(MediaDetailsSchema)),
  photos: v.optional(v.array(TweetPhotoSchema)),
  video: v.optional(TweetVideoSchema),
  conversation_count: CountSchema,
  news_action_type: v.literal('conversation'),
  quoted_tweet: v.optional(QuotedTweetSchema),
  in_reply_to_screen_name: v.optional(v.string()),
  in_reply_to_status_id_str: v.optional(IdSchema),
  in_reply_to_user_id_str: v.optional(IdSchema),
  parent: v.optional(TweetParentSchema),
  possibly_sensitive: v.optional(v.boolean()),
})
export const TweetSchema = v.pipe(
  TweetObjectSchema,
  v.forward(
    v.check(
      (tweet) => tweet.display_text_range[1] <= Array.from(tweet.text).length,
      'Range exceeds text length',
    ),
    ['display_text_range'],
  ),
)
const EnrichedQuotedTweetObjectSchema = v.intersect([
  v.omit(QuotedTweetObjectSchema, ['entities']),
  v.object({ url: v.string(), entities: v.array(EntitySchema) }),
])
export const EnrichedQuotedTweetSchema = v.pipe(
  EnrichedQuotedTweetObjectSchema,
  v.forward(
    v.check(
      (tweet) => tweet.display_text_range[1] <= Array.from(tweet.text).length,
      'Range exceeds text length',
    ),
    ['display_text_range'],
  ),
)
export const EnrichedTweetObjectSchema = v.intersect([
  v.omit(TweetObjectSchema, ['entities', 'quoted_tweet']),
  v.object({
    url: v.string(),
    user: v.object({ url: v.string(), follow_url: v.string() }),
    like_url: v.string(),
    reply_url: v.string(),
    in_reply_to_url: v.optional(v.string()),
    entities: v.array(EntitySchema),
    quoted_tweet: v.optional(EnrichedQuotedTweetSchema),
  }),
])

export const EnrichedTweetSchema = v.pipe(
  EnrichedTweetObjectSchema,
  v.forward(
    v.check(
      (tweet) => tweet.display_text_range[1] <= Array.from(tweet.text).length,
      'Range exceeds text length',
    ),
    ['display_text_range'],
  ),
)
