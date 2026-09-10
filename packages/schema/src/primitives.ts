import * as v from 'valibot'

export const NumberSchema = v.fallback(v.pipe(v.number(), v.finite()), 0)
export const StringSchema = v.fallback(v.string(), '')

function getEmptyArray(): never[] {
  return []
}

export function looseArray<
  const Item extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
>(item: Item) {
  return v.fallback(v.array(item), getEmptyArray)
}
