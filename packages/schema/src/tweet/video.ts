import * as v from 'valibot'

import { NumberSchema, StringSchema, looseArray } from '../primitives.ts'

export const TweetVideoSchema = v.object({
  aspectRatio: v.fallback(
    v.tuple([NumberSchema, NumberSchema]),
    () => [1, 1] satisfies [number, number],
  ),
  contentType: StringSchema,
  durationMs: NumberSchema,
  mediaAvailability: v.object({ status: StringSchema }),
  poster: StringSchema,
  variants: looseArray(
    v.object({
      type: StringSchema,
      src: StringSchema,
    }),
  ),
  videoId: v.object({
    type: StringSchema,
    id: StringSchema,
  }),
  viewCount: NumberSchema,
})
