import type {
  EnrichedTweet,
  Tweet,
} from '@post-embed/types/internal/tweet/index'
import type * as v from 'valibot'
import { expectTypeOf, test } from 'vitest'

import type { EnrichedTweetSchema, TweetSchema } from './index.ts'

test('TweetSchema', () => {
  expectTypeOf<v.InferOutput<typeof TweetSchema>>().toEqualTypeOf<Tweet>()
})

test('EnrichedTweetSchema', () => {
  expectTypeOf<
    v.InferOutput<typeof EnrichedTweetSchema>
  >().toEqualTypeOf<EnrichedTweet>()
})
