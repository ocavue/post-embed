import type { Tweet as UpstreamTweet } from 'react-tweet/api'
import { expectTypeOf, test } from 'vitest'

import type { Tweet } from './index.js'

test('Tweet accepts react-tweet data and optional quote thread metadata', () => {
  expectTypeOf<UpstreamTweet>().toExtend<Tweet>()
  expectTypeOf<Omit<Tweet, 'quoted_tweet'>>().toEqualTypeOf<
    Omit<UpstreamTweet, 'quoted_tweet'>
  >()
  expectTypeOf<
    NonNullable<Tweet['quoted_tweet']>['self_thread']
  >().toEqualTypeOf<
    NonNullable<UpstreamTweet['quoted_tweet']>['self_thread'] | undefined
  >()
})
