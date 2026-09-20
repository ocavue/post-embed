import type {
  XPost,
  XPostAuthor,
  XPostBase,
  XPostMedia,
  XPostPhoto,
  XPostSegment,
  XPostVideo,
  XPostVideoSource,
} from '@post-embed/types/internal/x/post'
import type * as v from 'valibot'
import { expectTypeOf, test } from 'vitest'

import type {
  XPostAuthorSchema,
  XPostBaseSchema,
  XPostMediaSchema,
  XPostPhotoSchema,
  XPostSchema,
  XPostSegmentSchema,
  XPostVideoSchema,
  XPostVideoSourceSchema,
} from './post.ts'

test('XPostSchema', () => {
  expectTypeOf<v.InferOutput<typeof XPostSchema>>().toEqualTypeOf<XPost>()
})

test('XPostBaseSchema', () => {
  expectTypeOf<
    v.InferOutput<typeof XPostBaseSchema>
  >().toEqualTypeOf<XPostBase>()
})

test('XPostAuthorSchema', () => {
  expectTypeOf<
    v.InferOutput<typeof XPostAuthorSchema>
  >().toEqualTypeOf<XPostAuthor>()
})

test('XPostSegmentSchema', () => {
  expectTypeOf<
    v.InferOutput<typeof XPostSegmentSchema>
  >().toEqualTypeOf<XPostSegment>()
})

test('XPostMediaSchema', () => {
  expectTypeOf<
    v.InferOutput<typeof XPostMediaSchema>
  >().toEqualTypeOf<XPostMedia>()
})

test('XPostPhotoSchema', () => {
  expectTypeOf<
    v.InferOutput<typeof XPostPhotoSchema>
  >().toEqualTypeOf<XPostPhoto>()
})

test('XPostVideoSchema', () => {
  expectTypeOf<
    v.InferOutput<typeof XPostVideoSchema>
  >().toEqualTypeOf<XPostVideo>()
})

test('XPostVideoSourceSchema', () => {
  expectTypeOf<
    v.InferOutput<typeof XPostVideoSourceSchema>
  >().toEqualTypeOf<XPostVideoSource>()
})
