import * as v from 'valibot'

export const StringSchema = v.fallback(v.string(), '')
export const NumberSchema = v.fallback(v.pipe(v.number(), v.finite()), 0)
export const BooleanSchema = v.fallback(v.boolean(), false)
export const PairSchema = v.fallback(
  v.pipe(
    v.array(v.unknown()),
    v.length(2),
    v.strictTuple([NumberSchema, NumberSchema]),
  ),
  () => [0, 0],
)

export function object<const Entries extends v.ObjectEntries>(
  entries: Entries,
) {
  // Missing object properties need an input default to run their field schemas.
  return v.optional(
    v.pipe(
      v.fallback(v.looseObject({}), () => ({})),
      v.object(entries),
    ),
    () => ({}),
  )
}
