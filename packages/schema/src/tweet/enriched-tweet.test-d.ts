import type {
  EnrichedTweet,
  EnrichedQuotedTweet,
} from '@post-embed/types/internal/tweet/enriched-tweet'
import type * as v from 'valibot'
import { expectTypeOf, test } from 'vitest'

import type {
  EnrichedTweetSchema,
  EnrichedQuotedTweetSchema,
} from './enriched-tweet.ts'

test('EnrichedTweetSchema', () => {
  expectTypeOf<
    v.InferOutput<typeof EnrichedTweetSchema>
  >().toEqualTypeOf<EnrichedTweet>()
})

test('EnrichedQuotedTweetSchema', () => {
  expectTypeOf<
    v.InferOutput<typeof EnrichedQuotedTweetSchema>
  >().toEqualTypeOf<EnrichedQuotedTweet>()
})
