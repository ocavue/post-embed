import { expect, test } from 'vitest'

import { YouTubeVideoSchema } from './video.ts'

async function parse(input: unknown) {
  const result = await YouTubeVideoSchema['~standard'].validate(input)
  expect(result.issues).toBeUndefined()
  if (result.issues) throw new Error('Expected successful validation')
  return result.value
}

test('defaults every field of an empty object', async () => {
  expect(await parse({})).toEqual({
    url: '',
    title: '',
    author_name: '',
    author_url: '',
    thumbnail_url: '',
    thumbnail_width: 0,
    thumbnail_height: 0,
    width: 0,
    height: 0,
  })
})

test('drops oEmbed fields it does not use', async () => {
  const video = await parse({
    url: 'https://youtu.be/aqz-KE-bpKQ',
    html: '<iframe></iframe>',
    provider_name: 'YouTube',
  })
  expect(video.url).toBe('https://youtu.be/aqz-KE-bpKQ')
  expect(video).not.toHaveProperty('html')
  expect(video).not.toHaveProperty('provider_name')
})

test.each([[undefined], [null], [42], ['video'], [[]]])(
  'rejects a non-object: %j',
  async (input) => {
    const result = await YouTubeVideoSchema['~standard'].validate(input)
    expect(result.issues?.length).toBeGreaterThan(0)
  },
)
