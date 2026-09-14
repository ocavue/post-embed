import { expect, it } from 'vitest'

import { toSource } from './media.ts'

it('ignores unsupported video formats', () => {
  expect(
    toSource('https://example.com/video.webm', 'video/webm'),
  ).toBeUndefined()
})

it.each(['', '   '])('ignores a video source with an empty URL %j', (url) => {
  expect(toSource(url, 'video/mp4', 1000)).toBeUndefined()
  expect(toSource(url, 'application/x-mpegURL')).toBeUndefined()
})
