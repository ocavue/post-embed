import { defineConfig } from 'astro/config'
import astrobook from 'astrobook'

const config: unknown = defineConfig({
  integrations: [
    astrobook({
      directory: 'src/stories',
      title: 'Post Embed',
      homeContent: {
        subtitle:
          'Local X post and YouTube video snapshots for debugging and testing',
      },
    }),
  ],
})

export default config
