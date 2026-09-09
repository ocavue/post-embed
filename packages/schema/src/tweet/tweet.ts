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
  BooleanSchema,
  NumberSchema,
  PairSchema,
  StringSchema,
  object,
} from './primitives.js'
import { TweetUserSchema } from './user.js'

const TweetBaseEntries = {
  lang: StringSchema,
  created_at: StringSchema,
  display_text_range: PairSchema,
  entities: v.optional(TweetEntitiesSchema),
  id_str: StringSchema,
  text: StringSchema,
  user: TweetUserSchema,
  edit_control: object({
    edit_tweet_ids: v.fallback(v.array(StringSchema), () => []),
    editable_until_msecs: StringSchema,
    is_edit_eligible: BooleanSchema,
    edits_remaining: StringSchema,
  }),
  isEdited: BooleanSchema,
  isStaleEdit: BooleanSchema,
  note_tweet: v.optional(object({ id: StringSchema })),
}
const QuotedTweetEntries = {
  ...TweetBaseEntries,
  reply_count: NumberSchema,
  retweet_count: NumberSchema,
  favorite_count: NumberSchema,
  mediaDetails: v.optional(v.fallback(v.array(MediaDetailsSchema), () => [])),
  self_thread: object({ id_str: StringSchema }),
}
const QuotedTweetSchema = object(QuotedTweetEntries)
const TweetParentSchema = object({
  ...TweetBaseEntries,
  reply_count: NumberSchema,
  retweet_count: NumberSchema,
  favorite_count: NumberSchema,
})
const TweetEntries = {
  ...TweetBaseEntries,
  __typename: v.fallback(v.literal('Tweet'), 'Tweet'),
  favorite_count: NumberSchema,
  mediaDetails: v.optional(v.fallback(v.array(MediaDetailsSchema), () => [])),
  photos: v.optional(v.fallback(v.array(TweetPhotoSchema), () => [])),
  video: v.optional(TweetVideoSchema),
  conversation_count: NumberSchema,
  news_action_type: v.fallback(v.literal('conversation'), 'conversation'),
  quoted_tweet: v.optional(QuotedTweetSchema),
  in_reply_to_screen_name: v.optional(StringSchema),
  in_reply_to_status_id_str: v.optional(StringSchema),
  in_reply_to_user_id_str: v.optional(StringSchema),
  parent: v.optional(TweetParentSchema),
  possibly_sensitive: v.optional(BooleanSchema),
}
export const TweetSchema = object(TweetEntries)
const EnrichedQuotedTweetSchema = v.intersect([
  object(v.omit(v.object(QuotedTweetEntries), ['entities']).entries),
  object({
    url: StringSchema,
    entities: v.fallback(v.array(EntitySchema), () => []),
  }),
])
export const EnrichedTweetSchema = v.intersect([
  object(v.omit(v.object(TweetEntries), ['entities', 'quoted_tweet']).entries),
  object({
    url: StringSchema,
    user: object({ url: StringSchema, follow_url: StringSchema }),
    like_url: StringSchema,
    reply_url: StringSchema,
    in_reply_to_url: v.optional(StringSchema),
    entities: v.fallback(v.array(EntitySchema), () => []),
    quoted_tweet: v.optional(EnrichedQuotedTweetSchema),
  }),
])
