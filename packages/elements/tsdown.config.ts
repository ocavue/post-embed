import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/index.ts', './src/x/index.ts', './src/youtube/index.ts'],
  copy: [
    {
      from: 'src/x/theme.css',
      to: 'dist/x/',
    },
    {
      from: 'src/youtube/theme.css',
      to: 'dist/youtube/',
    },
  ],
  fixedExtension: false,
})
