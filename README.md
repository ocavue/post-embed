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

Run `pnpm exec vitest` (or `pnpm test`) from the root to watch all runtime, browser, and type tests. Use `pnpm test:run` for a single run, as in CI.

Browser tests use Playwright Chromium, Firefox, and WebKit. Install them with `pnpm --filter @post-embed/elements exec playwright install`.

## Releases

Use Node.js 24 and the pnpm version in `packageManager`. Run `pnpm change` for changes that need a release and commit the generated `.changeset/*.md` file with your PR.

On pushes to `master`, the release workflow creates or updates a version PR with package versions, generated changelogs, and the lockfile. Merge that PR to release those versions. A separate job builds the packages and publishes versions that are not already on npm, using npm trusted publishing. This also publishes any initially unpublished package versions on the first run.

The workflow uses Changesets v3 and `changesets/action` v2. Changelogs use the default generator and the installed Prettier, without custom mutation steps. Private packages are excluded from versioning by default. The action only runs `ci:version` when release changesets exist, since v3 exits with an error when there is nothing to version.

Before enabling releases:

- Allow GitHub Actions to create pull requests in the repository's Actions settings.
- Optionally add a `BOT_GITHUB_TOKEN` secret with contents and pull request write access so release PRs trigger CI automatically. Without it, the workflow uses `GITHUB_TOKEN`; GitHub suppresses CI triggered by that token, so release PR checks need to be triggered manually.
- Configure an npm trusted publisher for each of `@post-embed/types`, `@post-embed/schema`, and `@post-embed/elements`, using owner `ocavue`, repository `post-embed`, and workflow `release.yml`. If a package does not exist on npm yet, publish its initial version manually first, then configure its trusted publisher.

`pnpm ci:version` updates versions and changelogs and refreshes the lockfile. `pnpm build:package` builds only the publishable packages. `pnpm ci:publish` publishes unpublished package versions with the `latest` tag.
