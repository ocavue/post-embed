import type { YouTubeVideo } from '@post-embed/types/internal/youtube/index'
import type * as v from 'valibot'
import { expectTypeOf, test } from 'vitest'

import type { YouTubeVideoSchema } from './index.ts'

test('YouTubeVideoSchema', () => {
  expectTypeOf<
    v.InferOutput<typeof YouTubeVideoSchema>
  >().toEqualTypeOf<YouTubeVideo>()
})
