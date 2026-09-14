import { expect, it } from 'vitest'

import { toSource } from './media.ts'

it('ignores unsupported video formats', () => {
  expect(
    toSource('https://example.com/video.webm', 'video/webm'),
  ).toBeUndefined()
})
