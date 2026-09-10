import { describe, expect, it } from 'vitest'

import { createMediaTweet, createTweet } from './testing/fixtures.ts'
import { enrichTweet } from './utils.ts'

describe('enrichTweet', () => {
  it('splits Unicode text and ordered link entities', () => {
    const tweet = createTweet('😀 @alice #web $ABC https://t.co/a')
    tweet.entities = {
      user_mentions: [
        { id_str: '1', name: 'Alice', screen_name: 'alice', indices: [2, 8] },
      ],
      hashtags: [{ text: 'web', indices: [9, 13] }],
      symbols: [{ text: 'ABC', indices: [14, 18] }],
      urls: [
        {
          url: 'https://t.co/a',
          expanded_url: 'https://example.com',
          display_url: 'example.com',
          indices: [19, 33],
        },
      ],
    }
    const result = enrichTweet(tweet)
    expect(result.entities.map((entity) => entity.type)).toEqual([
      'text',
      'mention',
      'text',
      'hashtag',
      'text',
      'symbol',
      'text',
      'url',
    ])
    expect(result.entities.map((entity) => entity.text).join('')).toBe(
      '😀 @alice #web $ABC example.com',
    )
    expect(result.user.url).toBe('https://x.com/example')
    expect(result.url).toBe('https://x.com/example/status/1234567890123456789')
  })

  it('uses the display range when entity collections are absent', () => {
    const tweet = createTweet('prefix 😀正文 suffix')
    tweet.entities = undefined
    tweet.display_text_range = [7, 10]
    expect(enrichTweet(tweet).entities).toEqual([
      { type: 'text', text: '😀正文', indices: [7, 10] },
    ])
  })

  it('retains upstream media range trimming for the tweet and quote', () => {
    const tweet = createMediaTweet()
    const result = enrichTweet(tweet)
    expect(
      result.entities
        .filter((entity) => entity.type !== 'media')
        .map((entity) => entity.text)
        .join(''),
    ).toBe('Saved text ')
    expect(result.display_text_range).toEqual([0, 11])
    expect(result.quoted_tweet?.display_text_range).toEqual([0, 11])
  })

  it('keeps the upstream zero-length display range', () => {
    const tweet = createTweet('Present but outside the display range')
    tweet.display_text_range = [0, 0]
    expect(
      enrichTweet(tweet)
        .entities.map((entity) => entity.text)
        .join(''),
    ).toBe('')
  })

  it('handles an empty media collection', () => {
    expect(
      enrichTweet(createTweet('Text'))
        .entities.map((entity) => entity.text)
        .join(''),
    ).toBe('Text')
  })
})
