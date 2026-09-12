import type { Tweet, XPost, YouTubeVideo } from '@post-embed/types'
import type { StandardSchemaV1 } from '@standard-schema/spec'
import { expectTypeOf, test } from 'vitest'

import { TweetSchema, XPostSchema, YouTubeVideoSchema } from './index.ts'

test('TweetSchema', () => {
  expectTypeOf(TweetSchema.async).toEqualTypeOf<false>()
  expectTypeOf<
    StandardSchemaV1.InferOutput<typeof TweetSchema>
  >().toEqualTypeOf<Tweet>()
})

test('XPostSchema', () => {
  expectTypeOf(XPostSchema.async).toEqualTypeOf<false>()
  expectTypeOf<
    StandardSchemaV1.InferOutput<typeof XPostSchema>
  >().toEqualTypeOf<XPost>()
})

test('YouTubeVideoSchema', () => {
  expectTypeOf(YouTubeVideoSchema.async).toEqualTypeOf<false>()
  expectTypeOf<
    StandardSchemaV1.InferOutput<typeof YouTubeVideoSchema>
  >().toEqualTypeOf<YouTubeVideo>()
})
