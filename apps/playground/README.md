# Post Embed playground

Astrobook stories for the local `@post-embed/elements/x` implementation.

```sh
pnpm install
pnpm --filter @post-embed/playground dev
```

Open http://localhost:3003 and choose an XPost story. Each story has its own URL for reproducible debugging. The fixtures are synthetic raw `Tweet` snapshots and require no X API access.

Examples cover links after emoji, whitespace, long text, Arabic, encoded HTML, empty text, missing/invalid data, a dark theme, and a narrow container. InvalidData intentionally logs a validation error.

Use the controls to clear, restore, replace, or reconnect a post and switch themes. Expand Raw snapshot to inspect the current input. Check that links and selection work, text wraps, and clear/restore leaves no stale content.

Add fixtures in `src/snapshots.ts` and stories in `src/stories/XPost.stories.ts`.

```sh
pnpm --filter @post-embed/playground build
pnpm --filter @post-embed/playground preview
```
