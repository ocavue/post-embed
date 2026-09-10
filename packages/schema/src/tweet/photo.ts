import * as v from 'valibot'

import { NumberSchema, StringSchema, looseArray } from '../primitives.ts'

import { RectSchema, RGBSchema } from './media.ts'

export const TweetPhotoSchema = v.object({
  backgroundColor: RGBSchema,
  cropCandidates: looseArray(RectSchema),
  expandedUrl: StringSchema,
  url: StringSchema,
  width: NumberSchema,
  height: NumberSchema,
})
