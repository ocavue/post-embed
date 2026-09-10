import { expect, it } from 'vitest'

import { registerXPost } from './index.ts'

// REVIEW: this test file is useless, just remove it
it('imports and registers harmlessly without a DOM', () => {
  expect(typeof window).toBe('undefined')
  expect(() => registerXPost()).not.toThrow()
})
