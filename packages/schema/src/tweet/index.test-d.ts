import type { Tweet } from '@post-embed/types/internal/tweet/index'
import type * as v from 'valibot'
import { expectTypeOf, test } from 'vitest'

import type { TweetSchema } from './index.ts'

test('TweetSchema', () => {
  expectTypeOf<v.InferOutput<typeof TweetSchema>>().toEqualTypeOf<Tweet>()
})
