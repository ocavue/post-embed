import type { Tweet as UpstreamTweet } from 'react-tweet/api'
import { expectTypeOf, test } from 'vitest'

import type { Tweet } from './index.js'

test('Tweet accepts react-tweet data', () => {
  expectTypeOf<UpstreamTweet>().toExtend<Tweet>()
})
