import * as v from 'valibot'

import {
  BooleanSchema,
  NumberSchema,
  StringSchema,
  looseArray,
} from '../primitives.ts'

import { TweetEditControlSchema } from './edit.ts'
import { IndicesSchema, TweetEntitiesSchema } from './entities.ts'
import { MediaDetailsSchema } from './media.ts'
import { TweetPhotoSchema } from './photo.ts'
import { TweetUserSchema } from './user.ts'
import { TweetVideoSchema } from './video.ts'

export const TweetBaseSchema = v.object({
  lang: StringSchema,
  created_at: StringSchema,
  display_text_range: IndicesSchema,
  entities: v.optional(TweetEntitiesSchema),
  id_str: StringSchema,
  text: StringSchema,
  user: TweetUserSchema,
  edit_control: TweetEditControlSchema,
  isEdited: BooleanSchema,
  isStaleEdit: BooleanSchema,
  note_tweet: v.optional(v.object({ id: StringSchema })),
})

export const TweetParentSchema = v.object({
  ...TweetBaseSchema.entries,
  reply_count: NumberSchema,
  retweet_count: NumberSchema,
  favorite_count: NumberSchema,
})

export const QuotedTweetSchema = v.object({
  ...TweetBaseSchema.entries,
  reply_count: NumberSchema,
  retweet_count: NumberSchema,
  favorite_count: NumberSchema,
  mediaDetails: v.optional(looseArray(MediaDetailsSchema)),
  self_thread: v.object({ id_str: StringSchema }),
})

export const TweetSchema = v.object({
  ...TweetBaseSchema.entries,
  __typename: v.fallback(v.literal('Tweet'), 'Tweet'),
  favorite_count: NumberSchema,
  mediaDetails: v.optional(looseArray(MediaDetailsSchema)),
  photos: v.optional(looseArray(TweetPhotoSchema)),
  video: v.optional(TweetVideoSchema),
  conversation_count: NumberSchema,
  news_action_type: v.fallback(v.literal('conversation'), 'conversation'),
  quoted_tweet: v.optional(QuotedTweetSchema),
  in_reply_to_screen_name: v.optional(StringSchema),
  in_reply_to_status_id_str: v.optional(StringSchema),
  in_reply_to_user_id_str: v.optional(StringSchema),
  parent: v.optional(TweetParentSchema),
  possibly_sensitive: v.optional(BooleanSchema),
})
