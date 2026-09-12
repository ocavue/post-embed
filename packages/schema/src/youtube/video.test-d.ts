import type { YouTubeVideo } from '@post-embed/types/internal/youtube/video'
import type * as v from 'valibot'
import { expectTypeOf, test } from 'vitest'

import type { YouTubeVideoSchema } from './video.ts'

test('YouTubeVideoSchema', () => {
  expectTypeOf<
    v.InferOutput<typeof YouTubeVideoSchema>
  >().toEqualTypeOf<YouTubeVideo>()
})
