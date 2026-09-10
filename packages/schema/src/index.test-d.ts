import type { EnrichedTweet, Tweet } from '@post-embed/types'
import type { StandardSchemaV1 } from '@standard-schema/spec'
import { safeParse } from 'valibot'
import { expectTypeOf, test } from 'vitest'

import {
  enrichedTweetSchema,
  tweetSchema,
  parseTweet,
  parseEnrichedTweet,
} from './index.ts'

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

test('synchronous parser results', () => {
  expectTypeOf(tweetSchema.async).toEqualTypeOf<false>()
  expectTypeOf(enrichedTweetSchema.async).toEqualTypeOf<false>()
  expectTypeOf(parseTweet({})).toEqualTypeOf<StandardSchemaV1.Result<Tweet>>()
  expectTypeOf(parseEnrichedTweet({})).toEqualTypeOf<
    StandardSchemaV1.Result<EnrichedTweet>
  >()
})
