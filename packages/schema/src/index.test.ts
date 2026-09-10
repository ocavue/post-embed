import { expect, test } from 'vitest'

import { enriched, raw } from './tweet/fixtures.ts'

import {
  parseEnrichedTweet,
  parseTweet,
  enrichedTweetSchema,
  tweetSchema,
} from './index.ts'

test('synchronous parsers match Standard Schema validation', async () => {
  for (const input of [raw, { user: {}, edit_control: {} }, {}, null]) {
    const expected = await tweetSchema['~standard'].validate(input)
    expect(parseTweet(input)).toEqual(expected)
  }
  for (const input of [enriched, {}, null]) {
    const expected = await enrichedTweetSchema['~standard'].validate(input)
    expect(parseEnrichedTweet(input)).toEqual(expected)
  }
})
