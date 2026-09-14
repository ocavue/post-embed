import * as v from 'valibot'

export const NumberSchema = v.fallback(v.pipe(v.number(), v.finite()), 0)
export const StringSchema = v.fallback(v.string(), '')
export const BooleanSchema = v.fallback(v.boolean(), false)

function getEmptyArray(): never[] {
  return []
}

export function looseArray<
  const Item extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
>(item: Item) {
  return v.fallback(v.array(item), getEmptyArray)
}

export function looseItems<
  const Item extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
>(item: Item) {
  return v.pipe(
    v.fallback(v.array(v.unknown()), () => []),
    v.transform((items): v.InferOutput<Item>[] => {
      return items.flatMap((value) => {
        const result = v.safeParse(item, value)
        return result.success ? [result.output] : []
      })
    }),
  )
}
