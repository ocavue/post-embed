import { describe, expect, it } from 'vitest'

import { segmentsToText, toSegments } from './segments.ts'

describe('toSegments', () => {
  it('splits Unicode text around ordered link entities', () => {
    const segments = toSegments('😀 @alice #web $ABC https://t.co/a', [0, 33], {
      urls: [
        {
          expanded_url: 'https://example.com',
          display_url: 'example.com',
          indices: [19, 33],
        },
      ],
      hashtags: [{ text: 'web', indices: [9, 13] }],
      symbols: [{ text: 'ABC', indices: [14, 18] }],
      user_mentions: [{ screen_name: 'alice', indices: [2, 8] }],
    })
    expect(segments).toEqual([
      { type: 'text', text: '😀 ' },
      { type: 'link', text: '@alice', url: 'https://x.com/alice' },
      { type: 'text', text: ' ' },
      { type: 'link', text: '#web', url: 'https://x.com/hashtag/web' },
      { type: 'text', text: ' ' },
      { type: 'link', text: '$ABC', url: 'https://x.com/search?q=%24ABC' },
      { type: 'text', text: ' ' },
      { type: 'link', text: 'example.com', url: 'https://example.com' },
    ])
    expect(segmentsToText(segments)).toBe('😀 @alice #web $ABC example.com')
  })

  it('cuts at the first media entity even when the display range counts UTF-16 units', () => {
    expect(
      toSegments(
        'This is a genius ad by Apple. 🔥🔥🔥🔥🔥 https://t.co/cNsA0MoOml',
        [0, 40],
        { media: [{ indices: [36, 59] }] },
      ),
    ).toEqual([
      { type: 'text', text: 'This is a genius ad by Apple. 🔥🔥🔥🔥🔥' },
    ])
  })

  it('clamps a range end past the text length', () => {
    expect(
      toSegments('Hi 👊🏼 https://t.co/x', [0, 22], {
        urls: [
          {
            indices: [6, 20],
            display_url: 'x',
            expanded_url: 'https://x.example',
          },
        ],
      }),
    ).toEqual([
      { type: 'text', text: 'Hi 👊🏼 ' },
      { type: 'link', text: 'x', url: 'https://x.example' },
    ])
  })

  it('hides leading mentions outside the display range', () => {
    expect(
      toSegments('@ada Nice long post', [5, 19], {
        user_mentions: [{ screen_name: 'ada', indices: [0, 4] }],
      }),
    ).toEqual([{ type: 'text', text: 'Nice long post' }])
  })

  it('decodes HTML character references after slicing', () => {
    expect(
      toSegments('A &amp; B &lt;i&gt; https://t.co/x', undefined, {
        urls: [
          {
            indices: [20, 34],
            display_url: 'x.com',
            expanded_url: 'https://x.com',
          },
        ],
      }),
    ).toEqual([
      { type: 'text', text: 'A & B <i> ' },
      { type: 'link', text: 'x.com', url: 'https://x.com' },
    ])
  })

  it('keeps newlines inside a segment and trims the trailing whitespace', () => {
    expect(toSegments('one\n\ntwo', undefined)).toEqual([
      { type: 'text', text: 'one\n\ntwo' },
    ])
    expect(
      toSegments('one\n\nhttps://t.co/m', undefined, {
        media: [{ indices: [5, 19] }],
      }),
    ).toEqual([{ type: 'text', text: 'one' }])
  })

  it('returns nothing for empty text and a zero-length range', () => {
    expect(toSegments('', [0, 0])).toEqual([])
    expect(toSegments('Text', [0, 0])).toEqual([])
  })

  it('ignores an entity without indices and one crossing the end', () => {
    expect(
      toSegments('abc https://t.co/x tail', [0, 8], {
        urls: [
          {
            indices: [4, 18],
            display_url: 'x',
            expanded_url: 'https://x.example',
          },
          { display_url: 'no' },
        ],
      }),
    ).toEqual([{ type: 'text', text: 'abc' }])
  })
})
