import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    'x/index': './src/x/index.ts',
    'x/bridge': './src/x/bridge.ts',
    'x/syndication': './src/x/syndication.ts',
  },
  fixedExtension: false,
})
