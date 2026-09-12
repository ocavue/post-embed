import type { Tweet as UpstreamTweet } from 'react-tweet/api'
import { expectTypeOf, test } from 'vitest'

import type { Tweet } from './index.js'

test('Tweet matches react-tweet', () => {
  expectTypeOf<Tweet>().toEqualTypeOf<UpstreamTweet>()
})
