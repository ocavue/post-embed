import { defineESLintConfig } from '@ocavue/eslint-config'

export default defineESLintConfig(
  { react: true },
  {
    files: ['packages/elements/src/x/x-post.ts'],
    // aria-ui hooks manage mutable DOM hosts outside React.
    rules: { 'react-hooks/immutability': 'off' },
  },
)
