// Source: https://github.com/vercel/react-tweet/blob/react-tweet@3.3.1/packages/react-tweet/src/api/types/entities.ts
// Source: https://github.com/vercel/react-tweet/blob/react-tweet@3.3.1/packages/react-tweet/src/utils.ts

import * as v from 'valibot'

import { IdSchema, IndicesSchema } from './primitives.js'

export const HashtagEntitySchema = v.object({
  indices: IndicesSchema,
  text: v.string(),
})
export const SymbolEntitySchema = v.object({
  indices: IndicesSchema,
  text: v.string(),
})
export const UrlEntitySchema = v.object({
  display_url: v.string(),
  expanded_url: v.string(),
  indices: IndicesSchema,
  url: v.string(),
})
export const MediaEntitySchema = UrlEntitySchema
export const UserMentionEntitySchema = v.object({
  id_str: IdSchema,
  indices: IndicesSchema,
  name: v.string(),
  screen_name: v.string(),
})
export const rawEntitySchemas = {
  hashtags: HashtagEntitySchema,
  urls: UrlEntitySchema,
  user_mentions: UserMentionEntitySchema,
  symbols: SymbolEntitySchema,
  media: MediaEntitySchema,
}
export const TweetEntitiesSchema = v.object({
  hashtags: v.array(HashtagEntitySchema),
  urls: v.array(UrlEntitySchema),
  user_mentions: v.array(UserMentionEntitySchema),
  symbols: v.array(SymbolEntitySchema),
  media: v.optional(v.array(MediaEntitySchema)),
})

export const EntitySchema = v.intersect([
  v.object({ text: v.string() }),
  v.union([
    v.object({ type: v.literal('text'), indices: IndicesSchema }),
    v.intersect([
      HashtagEntitySchema,
      v.object({ type: v.literal('hashtag'), href: v.string() }),
    ]),
    v.intersect([
      UserMentionEntitySchema,
      v.object({ type: v.literal('mention'), href: v.string() }),
    ]),
    v.intersect([
      UrlEntitySchema,
      v.object({ type: v.literal('url'), href: v.string() }),
    ]),
    v.intersect([
      MediaEntitySchema,
      v.object({ type: v.literal('media'), href: v.string() }),
    ]),
    v.intersect([
      SymbolEntitySchema,
      v.object({ type: v.literal('symbol'), href: v.string() }),
    ]),
  ]),
])
