import * as v from 'valibot'

export const IndicesSchema = v.fallback(
  v.pipe(
    v.array(v.unknown()),
    v.length(2),
    v.strictTuple([
      v.fallback(v.pipe(v.number(), v.finite()), 0),
      v.fallback(v.pipe(v.number(), v.finite()), 0),
    ]),
  ),
  () => [0, 0],
)

export const HashtagEntitySchema = v.object({
  indices: IndicesSchema,
  text: v.fallback(v.string(), ''),
})

export const UserMentionEntitySchema = v.object({
  id_str: v.fallback(v.string(), ''),
  indices: IndicesSchema,
  name: v.fallback(v.string(), ''),
  screen_name: v.fallback(v.string(), ''),
})

export const MediaEntitySchema = v.object({
  display_url: v.fallback(v.string(), ''),
  expanded_url: v.fallback(v.string(), ''),
  indices: IndicesSchema,
  url: v.fallback(v.string(), ''),
})

export const UrlEntitySchema = v.object({
  display_url: v.fallback(v.string(), ''),
  expanded_url: v.fallback(v.string(), ''),
  indices: IndicesSchema,
  url: v.fallback(v.string(), ''),
})

export const SymbolEntitySchema = v.object({
  indices: IndicesSchema,
  text: v.fallback(v.string(), ''),
})

export const TweetEntitiesSchema = v.object({
  hashtags: v.fallback(v.array(HashtagEntitySchema), () => []),
  urls: v.fallback(v.array(UrlEntitySchema), () => []),
  user_mentions: v.fallback(v.array(UserMentionEntitySchema), () => []),
  symbols: v.fallback(v.array(SymbolEntitySchema), () => []),
  media: v.optional(v.fallback(v.array(MediaEntitySchema), () => [])),
})
