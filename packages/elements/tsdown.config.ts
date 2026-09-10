import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/index.ts', './src/x/index.ts', ],
  copy: [{
    from: 'src/x/theme.css',
    to: 'dist/x/',
  }],
  fixedExtension: false,
})
