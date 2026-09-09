import type { EnrichedTweet, Tweet } from '@post-embed/types'
import type { StandardSchemaV1 } from '@standard-schema/spec'
import type * as v from 'valibot'
import { expectTypeOf, test } from 'vitest'

import type { EnrichedTweetSchema, TweetSchema } from './tweet/tweet.js'

import type { enrichedTweetSchema, tweetSchema } from './index.js'

test('schemas match the independent upstream types', () => {
  expectTypeOf<v.InferOutput<typeof TweetSchema>>().toEqualTypeOf<Tweet>()
  expectTypeOf<
    v.InferOutput<typeof EnrichedTweetSchema>
  >().toEqualTypeOf<EnrichedTweet>()
})

test('public schemas accept unknown and expose only the Standard Schema contract', () => {
  expectTypeOf<
    StandardSchemaV1.InferInput<typeof tweetSchema>
  >().toEqualTypeOf<unknown>()
  expectTypeOf<
    StandardSchemaV1.InferInput<typeof enrichedTweetSchema>
  >().toEqualTypeOf<unknown>()
  expectTypeOf<
    StandardSchemaV1.InferOutput<typeof tweetSchema>
  >().toEqualTypeOf<Tweet>()
  expectTypeOf<
    StandardSchemaV1.InferOutput<typeof enrichedTweetSchema>
  >().toEqualTypeOf<EnrichedTweet>()
})
