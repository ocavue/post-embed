import type { TweetPhoto } from '@post-embed/types/internal/tweet/photo'
import type * as v from 'valibot'
import { expectTypeOf, test } from 'vitest'

import type { TweetPhotoSchema } from './photo.ts'

test('TweetPhotoSchema', () => {
  expectTypeOf<
    v.InferOutput<typeof TweetPhotoSchema>
  >().toEqualTypeOf<TweetPhoto>()
})
