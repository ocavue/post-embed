# post-embed

Snapshot post components for the web. Pass saved tweet data to a custom element to render selectable text without fetching from X.

- `@post-embed/types`: tweet data types copied from react-tweet.
- `@post-embed/schema`: Standard Schema validation with field defaults.
- `@post-embed/elements/x`: the text-only X post element and explicit registration.

See [the element documentation](packages/elements/README.md) for usage and styling.

## Development

```sh
pnpm install
pnpm --filter @starter-monorepo/astro-app dev
```

Open `/x-post` for the vanilla snapshot demo. It includes long text, RTL, encoded text, clearing, reconnecting, and optional themes. The other apps and utility packages are starter scaffolding.

```sh
pnpm typecheck
pnpm --filter @post-embed/elements test
pnpm --filter @post-embed/elements build
```

Browser tests use Playwright Chromium, Firefox, and WebKit. Install them with `pnpm --filter @post-embed/elements exec playwright install`.
