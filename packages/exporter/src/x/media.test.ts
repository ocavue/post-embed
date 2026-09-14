import { mapXPostMediaUrls, type XPost } from '@post-embed/types'
import { expect, it } from 'vitest'

import { toSource } from './media.ts'

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

it('preserves video MIME types beyond MP4 and HLS', () => {
  expect(toSource('https://example.com/video.webm', 'video/webm')).toEqual({
    url: 'https://example.com/video.webm',
    type: 'video/webm',
  })
})
