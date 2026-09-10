import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: { 'x/index': './src/x/index.ts' },
  outDir: './dist',
  dts: true,
  copy: [{ from: './src/x/theme.css', to: './dist/x' }],
  outputOptions: { entryFileNames: '[name].js' },
})
