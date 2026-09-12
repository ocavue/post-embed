import { describe, expect, test } from 'vitest'

import { XPostSchema } from './post.ts'

const minimal = { author: {} }

async function parse(input: unknown) {
  const result = await XPostSchema['~standard'].validate(input)
  expect(result.issues).toBeUndefined()
  if (result.issues) throw new Error('Expected successful validation')
  return result.value
}

describe('XPostSchema', () => {
  test.each([{}, undefined, null, false, 42, 'post', []])(
    'rejects input without an author object: %j',
    async (input) => {
      const result = await XPostSchema['~standard'].validate(input)
      expect(result.issues?.length).toBeGreaterThan(0)
    },
  )

  test('defaults every scalar and collection', async () => {
    expect(await parse(minimal)).toEqual({
      id: '',
      createdAt: '',
      author: { name: '', handle: '' },
      body: [],
    })
  })

  test('drops unknown fields', async () => {
    const post = await parse({ ...minimal, favorite_count: 3, text: 'raw' })
    expect(post).not.toHaveProperty('favorite_count')
    expect(post).not.toHaveProperty('text')
  })

  test('defaults enums without adding members', async () => {
    const post = await parse({
      ...minimal,
      author: { avatarShape: 'triangle', verified: 'gold' },
      edit: 'maybe',
    })
    expect(post.author.avatarShape).toBeUndefined()
    expect(post.author.verified).toBeUndefined()
    expect(post.edit).toBeUndefined()
  })

  test('keeps valid enums', async () => {
    const post = await parse({
      ...minimal,
      author: { avatarShape: 'hexagon', verified: 'government' },
      edit: 'stale',
    })
    expect(post.author).toMatchObject({
      avatarShape: 'hexagon',
      verified: 'government',
    })
    expect(post.edit).toBe('stale')
  })

  test('selects segment and media variants by type', async () => {
    const post = await parse({
      ...minimal,
      body: [
        { type: 'text', text: 'Hi ' },
        { type: 'link', text: 'x.com', url: 'https://x.com' },
      ],
      media: [
        { type: 'photo', url: 'https://example.com/a.jpg' },
        { type: 'gif', sources: [{ url: 'https://example.com/a.mp4' }] },
      ],
    })
    expect(post.body).toEqual([
      { type: 'text', text: 'Hi ' },
      { type: 'link', text: 'x.com', url: 'https://x.com' },
    ])
    expect(post.media).toEqual([
      { type: 'photo', url: 'https://example.com/a.jpg', width: 0, height: 0 },
      {
        type: 'gif',
        width: 0,
        height: 0,
        sources: [{ url: 'https://example.com/a.mp4', type: 'video/mp4' }],
      },
    ])
  })

  test('replaces a collection with an unknown variant by an empty one', async () => {
    const post = await parse({
      ...minimal,
      body: [{ type: 'emoji', text: ':)' }],
      media: [{ type: 'audio' }],
    })
    expect(post.body).toEqual([])
    expect(post.media).toEqual([])
  })

  test('validates the quote and the reply target', async () => {
    const post = await parse({
      ...minimal,
      quote: { author: { name: 'Quoted' } },
      replyTo: { handle: 'jack', id: '20' },
    })
    expect(post.quote).toEqual({
      id: '',
      createdAt: '',
      author: { name: 'Quoted', handle: '' },
      body: [],
    })
    expect(post.replyTo).toEqual({ handle: 'jack', id: '20' })
    const result = await XPostSchema['~standard'].validate({
      ...minimal,
      quote: {},
    })
    expect(result.issues?.length).toBeGreaterThan(0)
  })
})
