import * as v from 'valibot'

import { PairSchema, StringSchema, object } from './primitives.js'

export const HashtagEntitySchema = object({
  indices: PairSchema,
  text: StringSchema,
})
export const SymbolEntitySchema = object({
  indices: PairSchema,
  text: StringSchema,
})
export const UrlEntitySchema = object({
  display_url: StringSchema,
  expanded_url: StringSchema,
  indices: PairSchema,
  url: StringSchema,
})
export const MediaEntitySchema = UrlEntitySchema
export const UserMentionEntitySchema = object({
  id_str: StringSchema,
  indices: PairSchema,
  name: StringSchema,
  screen_name: StringSchema,
})
export const TweetEntitiesSchema = object({
  hashtags: v.fallback(v.array(HashtagEntitySchema), () => []),
  urls: v.fallback(v.array(UrlEntitySchema), () => []),
  user_mentions: v.fallback(v.array(UserMentionEntitySchema), () => []),
  symbols: v.fallback(v.array(SymbolEntitySchema), () => []),
  media: v.optional(v.fallback(v.array(MediaEntitySchema), () => [])),
})

export const EntitySchema = v.intersect([
  object({ text: StringSchema }),
  v.union([
    object({ type: v.literal('text'), indices: PairSchema }),
    v.intersect([
      HashtagEntitySchema,
      object({ type: v.literal('hashtag'), href: StringSchema }),
    ]),
    v.intersect([
      UserMentionEntitySchema,
      object({ type: v.literal('mention'), href: StringSchema }),
    ]),
    v.intersect([
      UrlEntitySchema,
      object({ type: v.literal('url'), href: StringSchema }),
    ]),
    v.intersect([
      MediaEntitySchema,
      object({ type: v.literal('media'), href: StringSchema }),
    ]),
    v.intersect([
      SymbolEntitySchema,
      object({ type: v.literal('symbol'), href: StringSchema }),
    ]),
  ]),
])
