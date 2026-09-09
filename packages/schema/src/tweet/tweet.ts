import * as v from 'valibot'

import { TweetEditControlSchema } from './edit.ts'
import { IndicesSchema, TweetEntitiesSchema } from './entities.ts'
import { MediaDetailsSchema } from './media.ts'
import { TweetPhotoSchema } from './photo.ts'
import { TweetUserSchema } from './user.ts'
import { TweetVideoSchema } from './video.ts'

export const TweetBaseSchema = v.object({
  lang: v.fallback(v.string(), ''),
  created_at: v.fallback(v.string(), ''),
  display_text_range: IndicesSchema,
  entities: v.optional(TweetEntitiesSchema),
  id_str: v.fallback(v.string(), ''),
  text: v.fallback(v.string(), ''),
  user: TweetUserSchema,
  edit_control: TweetEditControlSchema,
  isEdited: v.fallback(v.boolean(), false),
  isStaleEdit: v.fallback(v.boolean(), false),
  note_tweet: v.optional(v.object({ id: v.fallback(v.string(), '') })),
})

export const TweetParentSchema = v.object({
  ...TweetBaseSchema.entries,
  reply_count: v.fallback(v.pipe(v.number(), v.finite()), 0),
  retweet_count: v.fallback(v.pipe(v.number(), v.finite()), 0),
  favorite_count: v.fallback(v.pipe(v.number(), v.finite()), 0),
})

export const QuotedTweetSchema = v.object({
  ...TweetBaseSchema.entries,
  reply_count: v.fallback(v.pipe(v.number(), v.finite()), 0),
  retweet_count: v.fallback(v.pipe(v.number(), v.finite()), 0),
  favorite_count: v.fallback(v.pipe(v.number(), v.finite()), 0),
  mediaDetails: v.optional(v.fallback(v.array(MediaDetailsSchema), () => [])),
  self_thread: v.object({ id_str: v.fallback(v.string(), '') }),
})

export const TweetSchema = v.object({
  ...TweetBaseSchema.entries,
  __typename: v.fallback(v.literal('Tweet'), 'Tweet'),
  favorite_count: v.fallback(v.pipe(v.number(), v.finite()), 0),
  mediaDetails: v.optional(v.fallback(v.array(MediaDetailsSchema), () => [])),
  photos: v.optional(v.fallback(v.array(TweetPhotoSchema), () => [])),
  video: v.optional(TweetVideoSchema),
  conversation_count: v.fallback(v.pipe(v.number(), v.finite()), 0),
  news_action_type: v.fallback(v.literal('conversation'), 'conversation'),
  quoted_tweet: v.optional(QuotedTweetSchema),
  in_reply_to_screen_name: v.optional(v.fallback(v.string(), '')),
  in_reply_to_status_id_str: v.optional(v.fallback(v.string(), '')),
  in_reply_to_user_id_str: v.optional(v.fallback(v.string(), '')),
  parent: v.optional(TweetParentSchema),
  possibly_sensitive: v.optional(v.fallback(v.boolean(), false)),
})
