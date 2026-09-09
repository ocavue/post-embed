import type * as v from 'valibot'
import { expectTypeOf, test } from 'vitest'

import type { TweetEditControl } from '@post-embed/types/internal/tweet/edit'

import type { TweetEditControlSchema } from './edit.ts' // FIXME: use ./edit.ts instead of ./edit.js. apply this rule to all files under schema/src/

test('TweetEditControlSchema', () => {
  expectTypeOf<v.InferOutput<typeof TweetEditControlSchema>>().toEqualTypeOf<TweetEditControl>()
})

// FIXME: use this pattern to rewite all *.test-d.ts files under schema/src/tweet/. we want the test to be super close to the schema file, and the test file should be 1-to-1 with the schema file.
