import * as v from 'valibot'

import { PairSchema, StringSchema } from './primitives.js'

export const HashtagEntitySchema = v.object({
  indices: PairSchema,
  text: StringSchema,
})
export const SymbolEntitySchema = v.object({
  indices: PairSchema,
  text: StringSchema,
})
export const UrlEntitySchema = v.object({
  display_url: StringSchema,
  expanded_url: StringSchema,
  indices: PairSchema,
  url: StringSchema,
})
export const MediaEntitySchema = UrlEntitySchema
export const UserMentionEntitySchema = v.object({
  id_str: StringSchema,
  indices: PairSchema,
  name: StringSchema,
  screen_name: StringSchema,
})
export const TweetEntitiesSchema = v.object({
  hashtags: v.fallback(v.array(HashtagEntitySchema), () => []),
  urls: v.fallback(v.array(UrlEntitySchema), () => []),
  user_mentions: v.fallback(v.array(UserMentionEntitySchema), () => []),
  symbols: v.fallback(v.array(SymbolEntitySchema), () => []),
  media: v.optional(v.fallback(v.array(MediaEntitySchema), () => [])),
})

export const EntitySchema = v.intersect([
  v.object({ text: StringSchema }),
  v.union([
    v.object({ type: v.literal('text'), indices: PairSchema }),
    v.intersect([
      HashtagEntitySchema,
      v.object({ type: v.literal('hashtag'), href: StringSchema }),
    ]),
    v.intersect([
      UserMentionEntitySchema,
      v.object({ type: v.literal('mention'), href: StringSchema }),
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
