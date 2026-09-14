import type { XPost } from '@post-embed/types'
import { expect, it } from 'vitest'

import { mapXPostMediaUrls } from './media.ts'

it('keeps source URLs when a resolver has no replacement', () => {
  const post: XPost = {
    id: '123',
    createdAt: '',
    body: [],
    author: {
      name: 'Example',
      handle: 'example',
      avatar: 'https://example.com/avatar.png',
    },
    media: [
      {
        type: 'photo',
        url: 'https://example.com/photo.png',
        width: 1,
        height: 1,
      },
      {
        type: 'video',
        width: 1,
        height: 1,
        poster: 'https://example.com/poster.png',
        sources: [{ url: 'https://example.com/video.mp4', type: 'video/mp4' }],
      },
    ],
  }
  expect(mapXPostMediaUrls(post, () => undefined)).toEqual(post)
  expect(mapXPostMediaUrls(post, () => '')).toEqual(post)
  const mapped = mapXPostMediaUrls(post, (url) => {
    return url.endsWith('/photo.png') ? 'reflect-asset://photo' : undefined
  })
  expect(mapped.media?.[0]).toMatchObject({ url: 'reflect-asset://photo' })
  expect(mapped.media?.[1]).toEqual(post.media?.[1])
  expect(post.media?.[0]).toMatchObject({
    url: 'https://example.com/photo.png',
  })
})

it('maps quoted media, avatars and video posters without changing attribution or text', () => {
  const quoted = {
    id: '456',
    createdAt: '',
    author: {
      name: 'Quoted',
      handle: 'quoted',
      avatar: 'https://cdn.test/avatar.png',
    },
    body: [{ type: 'text' as const, text: 'Original text' }],
    media: [
      {
        type: 'video' as const,
        width: 640,
        height: 360,
        poster: 'https://cdn.test/poster.jpg',
        sources: [
          { url: 'https://cdn.test/movie.mp4', type: 'video/mp4' as const },
        ],
      },
    ],
  }
  const post: XPost = { ...quoted, id: '123', quote: quoted }
  const original = structuredClone(post)
  const mapped = mapXPostMediaUrls(post, (url) => {
    return url.replace('https://cdn.test/', 'reflect-asset://')
  })
  expect(mapped.quote).toEqual({
    ...quoted,
    author: { ...quoted.author, avatar: 'reflect-asset://avatar.png' },
    media: [
      {
        type: 'video',
        width: 640,
        height: 360,
        poster: 'reflect-asset://poster.jpg',
        sources: [{ url: 'reflect-asset://movie.mp4', type: 'video/mp4' }],
      },
    ],
  })
  expect(mapped.author).toEqual(mapped.quote?.author)
  expect(mapped.media).toEqual(mapped.quote?.media)
  expect(post).toEqual(original)
})
