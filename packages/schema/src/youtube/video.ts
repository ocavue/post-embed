import type { YouTubeVideo } from '@post-embed/types'
import type { StandardSchemaV1 } from '@standard-schema/spec'
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

/**
 * Validates a snapshot synchronously, returning its value or validation issues.
 */
export function parseYouTubeVideo(
  input: unknown,
): StandardSchemaV1.Result<YouTubeVideo> {
  const result = YouTubeVideoSchema['~standard'].validate(input)
  if (result instanceof Promise) {
    throw new TypeError('YouTubeVideoSchema must be synchronous')
  }
  return result
}
