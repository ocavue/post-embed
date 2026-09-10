import * as v from 'valibot'
import { getEmptyArray, NumberSchema, StringSchema } from '../primitives.ts'

export const TweetVideoSchema = v.object({
  aspectRatio: v.fallback(
    v.pipe(
      v.array(v.unknown()),
      v.length(2),
      v.strictTuple([
        v.fallback(v.pipe(v.number(), v.finite()), 0),
        v.fallback(v.pipe(v.number(), v.finite()), 0),
      ]),
    ),
    () => [0, 0],
  ),
  contentType: v.fallback(v.string(), ''),
  durationMs: v.fallback(v.pipe(v.number(), v.finite()), 0),
  mediaAvailability: v.object({ status: v.fallback(v.string(), '') }),
  poster: v.fallback(v.string(), ''),
  variants: v.fallback(
    v.array(
      v.object({
        type: v.fallback(v.string(), ''),
        src: v.fallback(v.string(), ''),
      }),
    ),
    getEmptyArray,
  ),
  videoId: v.object({
    type: v.fallback(v.string(), ''),
    // FIXME: do use StringSchema here instead of v.fallback(v.string(), '') to avoid duplication. apply this to the whole project
    id: StringSchema,
  }),
  // FIXME: do use NumberSchema here instead of v.fallback(v.number(), v.finite(), 0) to avoid duplication
  viewCount: NumberSchema,
})
