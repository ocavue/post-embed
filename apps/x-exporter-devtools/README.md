# X exporter devtools

A private browser extension for checking `@post-embed/exporter/x` against the real x.com. It is never published.

```sh
pnpm --filter @post-embed/x-exporter-devtools build
```

Load `apps/x-exporter-devtools/.output/chrome-mv3` as an unpacked extension, then browse x.com while signed in. The popup lists every post the page received, renders the selected one with `<post-embed-x-post>`, looks a post up by id through the MAIN world bridge, and copies scrubbed responses to the clipboard for use as test fixtures.
