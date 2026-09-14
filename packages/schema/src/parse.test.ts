import type { Tweet, XPost, YouTubeVideo } from '@post-embed/types'
import type { StandardSchemaV1 } from '@standard-schema/spec'
import { expect, expectTypeOf, test } from 'vitest'

import {
  TweetSchema,
  XPostSchema,
  YouTubeVideoSchema,
  parseTweetSchema,
  parseXPostSchema,
  parseYouTubeVideoSchema,
} from './index.ts'

test('parsers return synchronous Standard Schema results', () => {
  expectTypeOf(parseTweetSchema({})).toEqualTypeOf<
    StandardSchemaV1.Result<Tweet>
  >()
  expectTypeOf(parseXPostSchema({})).toEqualTypeOf<
    StandardSchemaV1.Result<XPost>
  >()
  expectTypeOf(parseYouTubeVideoSchema({})).toEqualTypeOf<
    StandardSchemaV1.Result<YouTubeVideo>
  >()
})

const cases = [
  {
    name: 'Tweet',
    schema: TweetSchema,
    parse: parseTweetSchema,
    input: { user: {}, edit_control: {}, unknownField: true },
  },
  {
    name: 'XPost',
    schema: XPostSchema,
    parse: parseXPostSchema,
    input: { id: '123', author: {}, unknownField: true },
  },
  {
    name: 'YouTubeVideo',
    schema: YouTubeVideoSchema,
    parse: parseYouTubeVideoSchema,
    input: { title: 'Video', unknownField: true },
  },
]

for (const { name, schema, parse, input } of cases) {
  test(`${name} parser preserves defaults and strips unknown fields`, async () => {
    const result = parse(input)
    expect(result).not.toBeInstanceOf(Promise)
    expect(result.issues).toBeUndefined()
    expect(result).toEqual(await schema['~standard'].validate(input))
    if (result.issues) throw new Error('Expected successful validation')
    expect(result.value).not.toHaveProperty('unknownField')
  })

  test(`${name} parser returns validation issues synchronously`, async () => {
    const result = parse(null)
    expect(result).not.toBeInstanceOf(Promise)
    expect(result.issues?.length).toBeGreaterThan(0)
    const standard = await schema['~standard'].validate(null)
    expect(result.issues?.map(({ message }) => message)).toEqual(
      standard.issues?.map(({ message }) => message),
    )
  })
}
