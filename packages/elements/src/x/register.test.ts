import { expect, it } from 'vitest'

import { registerXPost } from './index.ts'

it('imports and registers harmlessly without a DOM', () => {
  expect(typeof window).toBe('undefined')
  expect(() => registerXPost()).not.toThrow()
})
