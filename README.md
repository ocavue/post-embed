# post-embed

Snapshot post components for the web. Pass saved tweet data to a custom element to render selectable text without fetching from X.

- `@post-embed/types`: tweet data types copied from react-tweet.
- `@post-embed/schema`: Standard Schema validation with field defaults.
- `@post-embed/elements/x`: the text-only X post element and explicit registration.

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
