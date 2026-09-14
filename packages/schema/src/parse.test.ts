import type { Tweet, XPost, YouTubeVideo } from '@post-embed/types'
import type { StandardSchemaV1 } from '@standard-schema/spec'
import { expect, expectTypeOf, test } from 'vitest'

import {
  TweetSchema,
  XPostSchema,
  YouTubeVideoSchema,
  parseTweet,
  parseXPost,
  parseYouTubeVideo,
} from './index.ts'

test('parsers return synchronous Standard Schema results', () => {
  expectTypeOf(parseTweet({})).toEqualTypeOf<StandardSchemaV1.Result<Tweet>>()
  expectTypeOf(parseXPost({})).toEqualTypeOf<StandardSchemaV1.Result<XPost>>()
  expectTypeOf(parseYouTubeVideo({})).toEqualTypeOf<
    StandardSchemaV1.Result<YouTubeVideo>
  >()
})

const cases = [
  {
    name: 'Tweet',
    schema: TweetSchema,
    parse: parseTweet,
    input: { user: {}, edit_control: {}, unknownField: true },
  },
  {
    name: 'XPost',
    schema: XPostSchema,
    parse: parseXPost,
    input: { id: '123', author: {}, unknownField: true },
  },
  {
    name: 'YouTubeVideo',
    schema: YouTubeVideoSchema,
    parse: parseYouTubeVideo,
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
