import type {
  Indices,
  HashtagEntity,
  UserMentionEntity,
  MediaEntity,
  UrlEntity,
  SymbolEntity,
  TweetEntities,
} from '@post-embed/types/internal/tweet/entities'
import type * as v from 'valibot'
import { expectTypeOf, test } from 'vitest'

import type {
  IndicesSchema,
  HashtagEntitySchema,
  UserMentionEntitySchema,
  MediaEntitySchema,
  UrlEntitySchema,
  SymbolEntitySchema,
  TweetEntitiesSchema,
} from './entities.ts'

test('IndicesSchema', () => {
  expectTypeOf<v.InferOutput<typeof IndicesSchema>>().toEqualTypeOf<Indices>()
})

test('HashtagEntitySchema', () => {
  expectTypeOf<
    v.InferOutput<typeof HashtagEntitySchema>
  >().toEqualTypeOf<HashtagEntity>()
})

test('UserMentionEntitySchema', () => {
  expectTypeOf<
    v.InferOutput<typeof UserMentionEntitySchema>
  >().toEqualTypeOf<UserMentionEntity>()
})

test('MediaEntitySchema', () => {
  expectTypeOf<
    v.InferOutput<typeof MediaEntitySchema>
  >().toEqualTypeOf<MediaEntity>()
})

test('UrlEntitySchema', () => {
  expectTypeOf<
    v.InferOutput<typeof UrlEntitySchema>
  >().toEqualTypeOf<UrlEntity>()
})

test('SymbolEntitySchema', () => {
  expectTypeOf<
    v.InferOutput<typeof SymbolEntitySchema>
  >().toEqualTypeOf<SymbolEntity>()
})

test('TweetEntitiesSchema', () => {
  expectTypeOf<
    v.InferOutput<typeof TweetEntitiesSchema>
  >().toEqualTypeOf<TweetEntities>()
})
