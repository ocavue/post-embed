import * as v from 'valibot'

import { RectSchema, RGBSchema } from './media.ts'

export const TweetPhotoSchema = v.object({
  backgroundColor: RGBSchema,
  cropCandidates: v.fallback(v.array(RectSchema), () => []),
  expandedUrl: v.fallback(v.string(), ''),
  url: v.fallback(v.string(), ''),
  width: v.fallback(v.pipe(v.number(), v.finite()), 0),
  height: v.fallback(v.pipe(v.number(), v.finite()), 0),
})
