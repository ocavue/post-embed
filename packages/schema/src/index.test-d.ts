import type { EnrichedTweet, Tweet } from '@post-embed/types'
import type { StandardSchemaV1 } from '@standard-schema/spec'
import { safeParse } from 'valibot'
import { expectTypeOf, test } from 'vitest'

import { enrichedTweetSchema, tweetSchema } from './index.ts'

test('tweetSchema', () => {
  expectTypeOf(safeParse(tweetSchema, {})).not.toExtend<PromiseLike<object>>()
  expectTypeOf<
    StandardSchemaV1.InferOutput<typeof tweetSchema>
  >().toEqualTypeOf<Tweet>()
})

test('enrichedTweetSchema', () => {
  expectTypeOf(safeParse(enrichedTweetSchema, {})).not.toExtend<
    PromiseLike<object>
  >()
  expectTypeOf<
    StandardSchemaV1.InferOutput<typeof enrichedTweetSchema>
  >().toEqualTypeOf<EnrichedTweet>()
})
