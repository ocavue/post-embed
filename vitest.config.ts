import { defineConfig } from 'vitest/config'

export default defineConfig({
  // FIXME: pure reformat of an unrelated file; revert.
  test: { projects: ['./packages/*/vitest.config.ts'] },
})
