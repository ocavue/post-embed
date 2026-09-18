# Post Embed playground

Astrobook stories for the local `@post-embed/elements/x` and `@post-embed/elements/youtube` implementations.

```sh
pnpm install
pnpm --filter @post-embed/playground dev
```

Open http://localhost:3003. The XPostGallery story shows every X post card on one page: realistic samples inside a mock note and in a grid, then the edge-case fixtures, each labeled with its rendered size, with light/dark, note font size, and container width controls. The XPost Debug story renders one fixture (pick it from the Snapshot select) with lifecycle controls, and Remote loads a real post by URL. The fixtures are synthetic raw `Tweet` snapshots and require no X API access.

Examples cover links after emoji, whitespace, long text, Arabic, encoded HTML, empty text, missing/invalid data, themes, and narrow containers. Additional stories exercise one to four photos, video, animated GIF, mixed media, sensitive/unavailable/broken media, quotes, reply context, square avatars, edits, truncated notes, counts, and legacy media fields. InvalidData intentionally logs a validation error.

Use the controls to clear, restore, replace, or reconnect a post and switch themes. Expand Raw snapshot to inspect the current input. Check that links and selection work, text wraps, and clear/restore leaves no stale content.

Media assets are original synthetic fixtures in `public/media/` and `public/samples/`. The two-second MP4 is a silent animation of a moving square. Valid media examples load entirely from the playground origin; BrokenMedia intentionally returns a missing-image error. Videos start with native controls and never autoplay.

Add edge-case fixtures in `src/snapshots.ts` or `src/media-snapshots.ts` and realistic samples in `src/x-samples.ts`; both show up in the gallery.

The YouTubeVideo stories render `@post-embed/elements/youtube` from synthetic oEmbed snapshots with a local poster. Basic, LongTitle, Short, StartTime, NoAuthor, DarkTheme, Narrow, MissingData, and InvalidData never contact YouTube. Inline reaches YouTube only after you click the poster, and Remote fetches `https://www.youtube.com/oembed` for the URL you enter. Add fixtures in `src/youtube-snapshots.ts` and stories in `src/stories/YouTubeVideo.stories.ts`.

```sh
pnpm --filter @post-embed/playground build
pnpm --filter @post-embed/playground preview
```
