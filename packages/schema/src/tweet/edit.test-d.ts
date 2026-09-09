import type * as v from 'valibot'
import { expectTypeOf, test } from 'vitest'

import type { TweetEditControl} from '../../../types/src/tweet/edit.js'

import type { TweetEditControlSchema } from './edit.js'

test('TweetEditControlSchema', () => {
  expectTypeOf<
    v.InferOutput<typeof TweetEditControlSchema>
  >().toEqualTypeOf<TweetEditControl>()
})
