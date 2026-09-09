import type { EnrichedTweet as UpstreamEnrichedTweet } from 'react-tweet'
import type { Tweet as UpstreamTweet } from 'react-tweet/api'
import { expectTypeOf, test } from 'vitest'

import type { EnrichedTweet, Tweet } from './index.js'

test('Tweet matches react-tweet', () => {
  expectTypeOf<Tweet>().toEqualTypeOf<UpstreamTweet>()
})

test('EnrichedTweet matches react-tweet', () => {
  expectTypeOf<EnrichedTweet>().toEqualTypeOf<UpstreamEnrichedTweet>()
})
