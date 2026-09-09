import * as v from 'valibot'

import type { TweetDataRepair } from '../result.js'

export type RepairContext = {
  path: (string | number)[]
  repairs: TweetDataRepair[]
}
export type Normalizer = (input: unknown, context: RepairContext) => unknown

export function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null && !Array.isArray(input)
}

export function at(
  context: RepairContext,
  key: string | number,
): RepairContext {
  return { ...context, path: [...context.path, key] }
}

export function recordRepair(
  context: RepairContext,
  code: TweetDataRepair['code'],
) {
  context.repairs.push({ path: context.path, code })
}

export function defaultProperty(
  object: Record<string, unknown>,
  key: string,
  value: unknown,
  context: RepairContext,
  nullish = false,
) {
  if (object[key] === undefined || (nullish && object[key] === null)) {
    recordRepair(
      at(context, key),
      object[key] === null ? 'defaulted-null' : 'defaulted-missing',
    )
    object[key] = value
  }
}

export function collectUnknownKeys(
  input: unknown,
  output: unknown,
  context: RepairContext,
) {
  if (Array.isArray(input) && Array.isArray(output)) {
    for (let index = 0; index < input.length; index++)
      collectUnknownKeys(input[index], output[index], at(context, index))
  } else if (isRecord(input) && isRecord(output)) {
    for (const [key, value] of Object.entries(input)) {
      if (!Object.hasOwn(output, key)) {
        recordRepair(at(context, key), 'discarded-unknown-key')
      } else collectUnknownKeys(value, output[key], at(context, key))
    }
  }
}

export function parseKnown<Schema extends v.GenericSchema>(
  schema: Schema,
  input: unknown,
  context: RepairContext,
) {
  const result = v.safeParse(schema, input)
  if (result.success) collectUnknownKeys(input, result.output, context)
  return result
}

export function repairList<Schema extends v.GenericSchema>(
  input: unknown,
  schema: Schema,
  context: RepairContext,
  normalize?: Normalizer,
): unknown {
  if (input == null) {
    recordRepair(
      context,
      input === null ? 'defaulted-null' : 'defaulted-missing',
    )
    return []
  }
  if (!Array.isArray(input)) return input
  const output: v.InferOutput<Schema>[] = []
  for (let index = 0; index < input.length; index++) {
    const child = { path: [...context.path, index], repairs: [] }
    const candidate: unknown = normalize
      ? normalize(input[index], child)
      : input[index]
    const result = parseKnown(schema, candidate, child)
    if (result.success) {
      output.push(result.output)
      context.repairs.push(...child.repairs)
    } else recordRepair(at(context, index), 'dropped-invalid-item')
  }
  return output
}

export function repairOptional<Schema extends v.GenericSchema>(
  object: Record<string, unknown>,
  key: string,
  schema: Schema,
  context: RepairContext,
  normalize?: Normalizer,
) {
  const input = object[key]
  if (input === undefined) {
    delete object[key]
    return
  }
  const child = { path: [...context.path, key], repairs: [] }
  const candidate = normalize ? normalize(input, child) : input
  const result = parseKnown(schema, candidate, child)
  if (result.success) {
    object[key] = result.output
    context.repairs.push(...child.repairs)
  } else {
    delete object[key]
    recordRepair(at(context, key), 'dropped-invalid-optional')
  }
}
