import * as v from 'valibot'

export const IdSchema = v.pipe(
  v.string(),
  v.regex(/^\d+$/, 'Expected a decimal ID string'),
)
export const NumberSchema = v.pipe(v.number(), v.finite())
export const CountSchema = v.pipe(NumberSchema, v.integer(), v.minValue(0))
export const NonNegativeSchema = v.pipe(NumberSchema, v.minValue(0))
export const DimensionSchema = v.pipe(
  NumberSchema,
  v.minValue(Number.MIN_VALUE),
)
export const RatioSchema = v.strictTuple([DimensionSchema, DimensionSchema])
export const IndicesSchema = v.pipe(
  v.strictTuple([CountSchema, CountSchema]),
  v.check(([start, end]) => start <= end, 'Expected an ordered range'),
)
export const TimestampSchema = v.pipe(
  v.string(),
  v.isoTimestamp(),
  v.check((value) => {
    const year = Number(value.slice(0, 4))
    const month = Number(value.slice(5, 7))
    const day = Number(value.slice(8, 10))
    const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
    const days = [
      31,
      leapYear ? 29 : 28,
      31,
      30,
      31,
      30,
      31,
      31,
      30,
      31,
      30,
      31,
    ]
    return (
      Number.isFinite(Date.parse(value)) &&
      day >= 1 &&
      day <= (days[month - 1] ?? 0)
    )
  }, 'Expected a valid timestamp'),
)
