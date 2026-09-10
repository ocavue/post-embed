# post-embed

Snapshot post components for the web. Pass saved tweet data to a custom element to render selectable text without fetching from X.

- `@post-embed/types`: tweet data types copied from react-tweet.
- `@post-embed/schema`: Standard Schema validation with field defaults.
- `@post-embed/elements/x`: the X post element with text, media, quotes, and explicit registration.

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

## Bundle size

Run `pnpm size` to measure the minified, gzip-compressed JavaScript for
`@post-embed/elements/x` and `@post-embed/schema`, including their runtime
dependencies. Each check retains all exports of its entry point and lets esbuild
remove unused dependency code. The X theme CSS is measured separately with gzip.
These are standalone entry measurements, so shared dependencies can appear in
both rows; adding the rows does not give the size of an application using both.
`@post-embed/types` only exports types and is excluded from runtime measurements.

The Size Limit workflow compares the PR against its base branch and updates a PR
comment with every configured measurement, including unchanged entries. The
checks report sizes without enforcing a budget. Add entries to `.size-limit.json`
when introducing new public runtime entry points. PRs from forks still run the
measurements, but GitHub's read-only token may prevent posting the comment.
