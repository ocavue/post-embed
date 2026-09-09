import * as v from 'valibot'

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
    () => [],
  ),
  videoId: v.object({
    type: v.fallback(v.string(), ''),
    id: v.fallback(v.string(), ''),
  }),
  viewCount: v.fallback(v.pipe(v.number(), v.finite()), 0),
})
