import type { ArraySchema } from 'valibot'
import * as v from 'valibot'

export const NumberSchema = v.fallback(v.pipe(v.number(), v.finite()), 0)
export const StringSchema = v.fallback(v.string(), '')

 function getEmptyArray(): never[] { return [] }

export function looseArray<const TItem extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>>(item: TItem):  v.SchemaWithFallback<ArraySchema<TItem, undefined>, () => never[]> {
  return v.fallback(v.array(item), getEmptyArray)
}
