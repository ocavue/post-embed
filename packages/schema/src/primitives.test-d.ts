import type * as v from 'valibot'
import { expectTypeOf, test } from 'vitest'

import type { NumberSchema, StringSchema, looseArray } from './primitives.ts'

test('NumberSchema', () => {
  expectTypeOf<v.InferOutput<typeof NumberSchema>>().toEqualTypeOf<number>()
})

test('StringSchema', () => {
  expectTypeOf<v.InferOutput<typeof StringSchema>>().toEqualTypeOf<string>()
})

test('looseArray preserves its item output type', () => {
  type StringsSchema = ReturnType<typeof looseArray<typeof StringSchema>>
  expectTypeOf<v.InferOutput<StringsSchema>>().toEqualTypeOf<string[]>()
})
