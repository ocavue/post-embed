import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      './packages/*/vitest.config.ts',
      { test: { name: 'types', include: ['packages/types/src/**/*.test.ts'] } },
    ],
  },
})
