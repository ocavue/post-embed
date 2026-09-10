import type { EnrichedTweet, Tweet } from '@post-embed/types'
import type { StandardSchemaV1 } from '@standard-schema/spec'
import { expectTypeOf, test } from 'vitest'

import type { enrichedTweetSchema, tweetSchema } from './index.ts'

test('tweetSchema', () => {
  expectTypeOf<
    StandardSchemaV1.InferInput<typeof tweetSchema>
  >().toEqualTypeOf<unknown>()
  expectTypeOf<
    StandardSchemaV1.InferOutput<typeof tweetSchema>
  >().toEqualTypeOf<Tweet>()
})

test('enrichedTweetSchema', () => {
  expectTypeOf<
    StandardSchemaV1.InferInput<typeof enrichedTweetSchema>
  >().toEqualTypeOf<unknown>()
  expectTypeOf<
    StandardSchemaV1.InferOutput<typeof enrichedTweetSchema>
  >().toEqualTypeOf<EnrichedTweet>()
})
