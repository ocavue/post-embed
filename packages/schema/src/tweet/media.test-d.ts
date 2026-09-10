import type {
  RGB,
  Rect,
  Size,
  VideoInfo,
  MediaPhoto,
  MediaAnimatedGif,
  MediaVideo,
  MediaDetails,
} from '@post-embed/types/internal/tweet/media'
import type * as v from 'valibot'
import { expectTypeOf, test } from 'vitest'

import type {
  RGBSchema,
  RectSchema,
  SizeSchema,
  VideoInfoSchema,
  MediaPhotoSchema,
  MediaAnimatedGifSchema,
  MediaVideoSchema,
  MediaDetailsSchema,
} from './media.ts'

test('RGBSchema', () => {
  expectTypeOf<v.InferOutput<typeof RGBSchema>>().toEqualTypeOf<RGB>()
})

test('RectSchema', () => {
  expectTypeOf<v.InferOutput<typeof RectSchema>>().toEqualTypeOf<Rect>()
})

test('SizeSchema', () => {
  expectTypeOf<v.InferOutput<typeof SizeSchema>>().toEqualTypeOf<Size>()
})

test('VideoInfoSchema', () => {
  expectTypeOf<
    v.InferOutput<typeof VideoInfoSchema>
  >().toEqualTypeOf<VideoInfo>()
})

test('MediaPhotoSchema', () => {
  expectTypeOf<
    v.InferOutput<typeof MediaPhotoSchema>
  >().toEqualTypeOf<MediaPhoto>()
})

test('MediaAnimatedGifSchema', () => {
  expectTypeOf<
    v.InferOutput<typeof MediaAnimatedGifSchema>
  >().toEqualTypeOf<MediaAnimatedGif>()
})

test('MediaVideoSchema', () => {
  expectTypeOf<
    v.InferOutput<typeof MediaVideoSchema>
  >().toEqualTypeOf<MediaVideo>()
})

test('MediaDetailsSchema', () => {
  expectTypeOf<
    v.InferOutput<typeof MediaDetailsSchema>
  >().toEqualTypeOf<MediaDetails>()
})
