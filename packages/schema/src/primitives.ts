import * as v from 'valibot'

export const NumberSchema = v.fallback(v.pipe(v.number(), v.finite()), 0)
export const StringSchema = v.fallback(v.string(), '')

export function getEmptyArray(): never[] { return [] }
