import type { StandardSchemaV1 } from '@standard-schema/spec'
import type * as v from 'valibot'

import type { RepairedTweet } from './result.js'
import { normalizeTweet } from './tweet/normalize.js'
import { parseKnown, type RepairContext } from './tweet/repair.js'

export function parseTweet<Schema extends v.GenericSchema>(
  schema: Schema,
  input: unknown,
  enriched: boolean,
): StandardSchemaV1.Result<RepairedTweet<v.InferOutput<Schema>>> {
  const context: RepairContext = { path: [], repairs: [] }
  const candidate = normalizeTweet(input, context, 'tweet', enriched)
  const result = parseKnown(schema, candidate, context)
  if (!result.success) {
    return {
      issues: result.issues.map((issue) => ({
        message:
          issue.type === 'check' || issue.type === 'regex'
            ? issue.message
            : `Expected ${issue.expected ?? 'valid data'}`,
        path: issue.path?.flatMap(({ key }) => {
          return typeof key === 'string' || typeof key === 'number' ? [key] : []
        }),
      })),
    }
  }
  return { value: { data: result.output, repairs: context.repairs } }
}

export function createSchemas<Output>(
  parse: (input: unknown) => StandardSchemaV1.Result<RepairedTweet<Output>>,
): {
  schema: StandardSchemaV1<unknown, Output>
  withRepairsSchema: StandardSchemaV1<unknown, RepairedTweet<Output>>
} {
  return {
    schema: {
      '~standard': {
        version: 1,
        vendor: 'post-embed',
        validate(input) {
          const result = parse(input)
          return result.issues
            ? { issues: result.issues }
            : { value: result.value.data }
        },
      },
    },
    withRepairsSchema: {
      '~standard': { version: 1, vendor: 'post-embed', validate: parse },
    },
  }
}
