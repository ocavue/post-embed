import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: './src/index.ts',
    'tweet/edit': './src/tweet/edit.ts',
    'tweet/enriched-tweet': './src/tweet/enriched-tweet.ts',
    'tweet/entities': './src/tweet/entities.ts',
    'tweet/index': './src/tweet/index.ts',
    'tweet/media': './src/tweet/media.ts',
    'tweet/photo': './src/tweet/photo.ts',
    'tweet/tweet': './src/tweet/tweet.ts',
    'tweet/user': './src/tweet/user.ts',
    'tweet/video': './src/tweet/video.ts',
  },
  outDir: './dist',
  dts: true,
  fixedExtension: false,
})
