import type { TweetEditControl } from '@post-embed/types/internal/tweet/edit'
import type * as v from 'valibot'
import { expectTypeOf, test } from 'vitest'

import type { TweetEditControlSchema } from './edit.ts'

test('TweetEditControlSchema', () => {
  expectTypeOf<
    v.InferOutput<typeof TweetEditControlSchema>
  >().toEqualTypeOf<TweetEditControl>()
})
