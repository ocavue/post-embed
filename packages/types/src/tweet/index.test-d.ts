import type { Tweet as UpstreamTweet } from 'react-tweet/api'
import { expectTypeOf, test } from 'vitest'

import type { Tweet } from './index.js'

test('Tweet accepts react-tweet data', () => {// FIXME: revert the change in this file. we want UpstreamTweet and Tweet are exactly the same type
  expectTypeOf<UpstreamTweet>().toExtend<Tweet>()
})
