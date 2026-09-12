import type { XPost } from '@post-embed/types/internal/x/index'
import type * as v from 'valibot'
import { expectTypeOf, test } from 'vitest'

import type { XPostSchema } from './index.ts'

test('XPostSchema', () => {
  expectTypeOf<v.InferOutput<typeof XPostSchema>>().toEqualTypeOf<XPost>()
})
