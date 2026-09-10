import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'schema',
    typecheck: {
      enabled: true,
    },
  },
})
