import * as v from 'valibot'

import { NumberSchema, StringSchema } from '../primitives.ts'

export const YouTubeVideoSchema = v.object({
  url: StringSchema,
  title: StringSchema,
  author_name: StringSchema,
  author_url: StringSchema,
  thumbnail_url: StringSchema,
  thumbnail_width: NumberSchema,
  thumbnail_height: NumberSchema,
  width: NumberSchema,
  height: NumberSchema,
})
