import type {
  HighlightedBadge,
  UserHighlightedLabel,
  TweetUser,
} from '@post-embed/types/internal/tweet/user'
import type * as v from 'valibot'
import { expectTypeOf, test } from 'vitest'

import type {
  HighlightedBadgeSchema,
  UserHighlightedLabelSchema,
  TweetUserSchema,
} from './user.ts'

test('HighlightedBadgeSchema', () => {
  expectTypeOf<
    v.InferOutput<typeof HighlightedBadgeSchema>
  >().toEqualTypeOf<HighlightedBadge>()
})

test('UserHighlightedLabelSchema', () => {
  expectTypeOf<
    v.InferOutput<typeof UserHighlightedLabelSchema>
  >().toEqualTypeOf<UserHighlightedLabel>()
})

test('TweetUserSchema', () => {
  expectTypeOf<
    v.InferOutput<typeof TweetUserSchema>
  >().toEqualTypeOf<TweetUser>()
})
