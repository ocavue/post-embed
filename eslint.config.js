import { defineESLintConfig } from '@ocavue/eslint-config'

export default defineESLintConfig(
  { react: false, jsdoc: true, ocavue: true },
  { ignores: ['**/.wxt/', '**/.output/'] },
)
