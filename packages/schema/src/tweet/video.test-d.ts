import type { TweetVideo } from '@post-embed/types/internal/tweet/video'
import type * as v from 'valibot'
import { expectTypeOf, test } from 'vitest'

import type { TweetVideoSchema } from './video.ts'

test('TweetVideoSchema', () => {
  expectTypeOf<
    v.InferOutput<typeof TweetVideoSchema>
  >().toEqualTypeOf<TweetVideo>()
})
