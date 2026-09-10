import * as v from 'valibot'

import { StringSchema, looseArray } from '../primitives.ts'

import {
  HashtagEntitySchema,
  IndicesSchema,
  MediaEntitySchema,
  SymbolEntitySchema,
  UrlEntitySchema,
  UserMentionEntitySchema,
} from './entities.ts'
import { QuotedTweetSchema, TweetSchema } from './tweet.ts'

const TextEntitySchema = v.object({
  indices: IndicesSchema,
  type: v.literal('text'),
})

const EntitySchema = v.intersect([
  v.object({ text: StringSchema }),
  v.union([
    TextEntitySchema,
    v.intersect([
      HashtagEntitySchema,
      v.object({
        type: v.literal('hashtag'),
        href: StringSchema,
      }),
    ]),
    v.intersect([
      UserMentionEntitySchema,
      v.object({
        type: v.literal('mention'),
        href: StringSchema,
      }),
    ]),
    v.intersect([
      UrlEntitySchema,
      v.object({ type: v.literal('url'), href: StringSchema }),
    ]),
    v.intersect([
      MediaEntitySchema,
      v.object({ type: v.literal('media'), href: StringSchema }),
    ]),
    v.intersect([
      SymbolEntitySchema,
      v.object({ type: v.literal('symbol'), href: StringSchema }),
    ]),
  ]),
])

export const EnrichedQuotedTweetSchema = v.intersect([
  v.omit(QuotedTweetSchema, ['entities']),
  v.object({
    url: StringSchema,
    entities: looseArray(EntitySchema),
  }),
])

export const EnrichedTweetSchema = v.intersect([
  v.omit(TweetSchema, ['entities', 'quoted_tweet']),
  v.object({
    url: StringSchema,
    user: v.object({
      url: StringSchema,
      follow_url: StringSchema,
    }),
    like_url: StringSchema,
    reply_url: StringSchema,
    in_reply_to_url: v.optional(StringSchema),
    entities: looseArray(EntitySchema),
    quoted_tweet: v.optional(EnrichedQuotedTweetSchema),
  }),
])
