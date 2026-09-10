import type { EnrichedTweet, Tweet } from '@post-embed/types'
import type { StandardSchemaV1 } from '@standard-schema/spec'
import { expectTypeOf, test } from 'vitest'

import { EnrichedTweetSchema, TweetSchema } from './index.ts'

test('TweetSchema', () => {
  expectTypeOf(TweetSchema.async).toEqualTypeOf<false>()
  expectTypeOf<
    StandardSchemaV1.InferOutput<typeof TweetSchema>
  >().toEqualTypeOf<Tweet>()
})

test('EnrichedTweetSchema', () => {
  expectTypeOf(EnrichedTweetSchema.async).toEqualTypeOf<false>()
  expectTypeOf<
    StandardSchemaV1.InferOutput<typeof EnrichedTweetSchema>
  >().toEqualTypeOf<EnrichedTweet>()
})
