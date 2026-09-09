import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import nova from 'starlight-theme-nova'

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: 'My Docs',
      plugins: [nova()],
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/ocavue/starter-monorepo',
        },
      ],
      sidebar: [
        {
          label: 'Guides',
          items: [
            // Each item here is one entry in the navigation menu.
            { label: 'Example Guide', slug: 'guides/example' },
          ],
        },
        {
          label: 'Reference',
          items: [{ autogenerate: { directory: 'reference' } }],
        },
      ],
    }),
  ],
})
