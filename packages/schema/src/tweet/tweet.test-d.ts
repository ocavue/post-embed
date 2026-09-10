import type {
  TweetBase,
  Tweet,
  TweetParent,
  QuotedTweet,
} from '@post-embed/types/internal/tweet/tweet'
import type * as v from 'valibot'
import { expectTypeOf, test } from 'vitest'

import type {
  TweetBaseSchema,
  TweetSchema,
  TweetParentSchema,
  QuotedTweetSchema,
} from './tweet.ts'

test('TweetBaseSchema', () => {
  expectTypeOf<
    v.InferOutput<typeof TweetBaseSchema>
  >().toEqualTypeOf<TweetBase>()
})

test('TweetSchema', () => {
  expectTypeOf<v.InferOutput<typeof TweetSchema>>().toEqualTypeOf<Tweet>()
})

test('TweetParentSchema', () => {
  expectTypeOf<
    v.InferOutput<typeof TweetParentSchema>
  >().toEqualTypeOf<TweetParent>()
})

test('QuotedTweetSchema', () => {
  expectTypeOf<
    v.InferOutput<typeof QuotedTweetSchema>
  >().toEqualTypeOf<QuotedTweet>()
})
