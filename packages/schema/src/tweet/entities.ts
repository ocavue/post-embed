import * as v from 'valibot'

import { NumberSchema, StringSchema, looseArray } from '../primitives.ts'

export const IndicesSchema = v.fallback(
  v.tuple([NumberSchema, NumberSchema]),
  () => [0, 0] satisfies [number, number],
)

export const HashtagEntitySchema = v.object({
  indices: IndicesSchema,
  text: StringSchema,
})

export const UserMentionEntitySchema = v.object({
  id_str: StringSchema,
  indices: IndicesSchema,
  name: StringSchema,
  screen_name: StringSchema,
})

export const MediaEntitySchema = v.object({
  display_url: StringSchema,
  expanded_url: StringSchema,
  indices: IndicesSchema,
  url: StringSchema,
})

export const UrlEntitySchema = v.object({
  display_url: StringSchema,
  expanded_url: StringSchema,
  indices: IndicesSchema,
  url: StringSchema,
})

export const SymbolEntitySchema = v.object({
  indices: IndicesSchema,
  text: StringSchema,
})

export const TweetEntitiesSchema = v.object({
  hashtags: looseArray(HashtagEntitySchema),
  urls: looseArray(UrlEntitySchema),
  user_mentions: looseArray(UserMentionEntitySchema),
  symbols: looseArray(SymbolEntitySchema),
  media: v.optional(looseArray(MediaEntitySchema)),
})
