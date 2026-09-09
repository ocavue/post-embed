import * as v from 'valibot'

import {
  HashtagEntitySchema,
  IndicesSchema,
  MediaEntitySchema,
  SymbolEntitySchema,
  UrlEntitySchema,
  UserMentionEntitySchema,
} from './entities.js'
import { QuotedTweetSchema, TweetSchema } from './tweet.js'

const TextEntitySchema = v.object({
  indices: IndicesSchema,
  type: v.literal('text'),
})

const EntitySchema = v.intersect([
  v.object({ text: v.fallback(v.string(), '') }),
  v.union([
    TextEntitySchema,
    v.intersect([
      HashtagEntitySchema,
      v.object({
        type: v.literal('hashtag'),
        href: v.fallback(v.string(), ''),
      }),
    ]),
    v.intersect([
      UserMentionEntitySchema,
      v.object({
        type: v.literal('mention'),
        href: v.fallback(v.string(), ''),
      }),
    ]),
    v.intersect([
      UrlEntitySchema,
      v.object({ type: v.literal('url'), href: v.fallback(v.string(), '') }),
    ]),
    v.intersect([
      MediaEntitySchema,
      v.object({ type: v.literal('media'), href: v.fallback(v.string(), '') }),
    ]),
    v.intersect([
      SymbolEntitySchema,
      v.object({ type: v.literal('symbol'), href: v.fallback(v.string(), '') }),
    ]),
  ]),
])

export const EnrichedQuotedTweetSchema = v.intersect([
  v.omit(QuotedTweetSchema, ['entities']),
  v.object({
    url: v.fallback(v.string(), ''),
    entities: v.fallback(v.array(EntitySchema), () => []),
  }),
])

export const EnrichedTweetSchema = v.intersect([
  v.omit(TweetSchema, ['entities', 'quoted_tweet']),
  v.object({
    url: v.fallback(v.string(), ''),
    user: v.object({
      url: v.fallback(v.string(), ''),
      follow_url: v.fallback(v.string(), ''),
    }),
    like_url: v.fallback(v.string(), ''),
    reply_url: v.fallback(v.string(), ''),
    in_reply_to_url: v.optional(v.fallback(v.string(), '')),
    entities: v.fallback(v.array(EntitySchema), () => []),
    quoted_tweet: v.optional(EnrichedQuotedTweetSchema),
  }),
])
