import { expect, it } from 'vitest'

import { parseXPostId } from './url.ts'

it.each([
  'https://x.com/jack/status/123',
  'https://twitter.com/jack/status/123?s=20',
  'https://www.x.com/jack/statuses/123/',
  'https://mobile.twitter.com/jack/status/123/photo/1',
  'https://x.com/i/web/status/123/video/2',
])('extracts the post ID from %s', (url) => {
  expect(parseXPostId(url)).toBe('123')
})

it.each([
  '',
  'not a URL',
  'http://x.com/jack/status/123',
  'https://x.com.evil.test/jack/status/123',
  'https://evil.test/x.com/jack/status/123',
  'https://user:password@x.com/jack/status/123',
  'https://x.com:8080/jack/status/123',
  'https://x.com/jack/status/0',
  'https://x.com/jack/status/0123',
  'https://x.com/jack/status/123456789012345678901',
  'https://x.com/jack/status/abc',
  'https://x.com/jack/status/123/other',
  'https://x.com/jack',
])('rejects invalid post URL %s', (url) => {
  expect(parseXPostId(url)).toBeUndefined()
})
