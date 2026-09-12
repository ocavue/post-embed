# post-embed

Snapshot post components for the web. Pass saved tweet or YouTube oEmbed data to a custom element to render it without fetching from X or YouTube.

- `@post-embed/types`: tweet data types copied from react-tweet, plus the YouTube oEmbed snapshot type.
- `@post-embed/schema`: Standard Schema validation with field defaults.
- `@post-embed/elements/x`: the X post element with text, media, quotes, and explicit registration.
- `@post-embed/elements/youtube`: the YouTube video card built from oEmbed data, with optional click-to-play.

See [the element documentation](packages/elements/README.md) for usage and styling.

## Development

```sh
pnpm install
pnpm dev
```

Open http://localhost:3003 for the [Astrobook playground](apps/playground/README.md). Its X post stories cover text, links, RTL, missing and invalid snapshots, and themes, with controls for updating and reconnecting posts.

```sh
pnpm typecheck
pnpm test
pnpm test:run
pnpm build
```
