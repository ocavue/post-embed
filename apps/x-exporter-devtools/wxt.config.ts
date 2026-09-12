import { defineConfig } from 'wxt'

export default defineConfig({
  manifest: {
    name: 'post-embed X exporter devtools',
    description:
      'Verifies @post-embed/exporter/x on x.com. Not for distribution.',
    permissions: ['storage', 'tabs'],
    host_permissions: ['https://x.com/*', 'https://mobile.x.com/*'],
  },
})
