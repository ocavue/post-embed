# @post-embed/elements

Snapshot elements for saved `Tweet` data. The X element renders text, author information, photos, videos, quoted posts, reply context, and engagement links. It does not fetch, refresh, or persist tweet data.

## Usage

```ts
import '@post-embed/elements/x/theme.css'

import { registerXPost } from '@post-embed/elements/x'
import type { Tweet } from '@post-embed/types'

export function showTweet(container: HTMLElement, savedTweet: Tweet) {
  registerXPost()
  const element = document.createElement('post-embed-x-post')
  element.data = savedTweet
  container.append(element)
  return element
}
```

Register before creating the element or assigning data. Registration is a silent no-op if the name is already registered, and in Node. Importing does not register elements. Only `./x` and `./x/theme.css` are exported; there is no root entry.

Pass a name to `registerXPost('my-x-post')` to register another tag. Multiple names can coexist. For custom names, use `XPostElement` to type the created element or extend your application's `HTMLElementTagNameMap`. The default tag name is the only one declared globally by this package.

`XPostProps` describes the data property. The `@internal` `useXPost(host, props)` function is also exported for composing an aria-ui host with `State<XPostProps>`.

Assign a new raw `Tweet` object to update, or `null` to show the unavailable fallback. Data is a property, never a JSON attribute. In-place mutations do not trigger updates. The element validates synchronously with `TweetSchema`, copies the result, and runs the locally copied upstream `enrichTweet` implementation. It does not change the host's snapshot. `EnrichedTweet` is not an accepted input.

Null or invalid data displays an unavailable card. Invalid data also logs its validation issues to `console.error`. Empty visible text stays empty, with available attribution retained. Schema defaults do not prove completeness: a default empty display range can hide nonempty raw text. Upstream range trimming and media entity omission are retained. Truncated snapshots cannot recover missing text. Images, avatars, badges, and video posters load from the snapshot URLs. Videos use `preload="none"` and start through native controls. Sensitive media URLs are attached only after the reader clicks Show potentially sensitive media.

Text entities are decoded once with `entities`, then rendered as text by Lit. Links and media accept absolute HTTP(S) URLs without credentials. Hosts can rewrite media URLs in the snapshot to their own archive origin. Unsafe destinations stay readable as text. External links open in a new tab with `noopener noreferrer`.

## Supported content

The presentation follows [react-tweet 3.3.1](https://github.com/vercel/react-tweet/tree/react-tweet%403.3.1/packages/react-tweet/src/twitter-theme), using Lit and native browser controls.

| Snapshot feature               | Rendering                                                                                                 |
| ------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Author                         | Avatar, circle/square/hexagon shape, name, handle, verified account type, organization label, Follow link |
| Text                           | Unicode, RTL, whitespace, links, hashtags, mentions, cashtags; `note_tweet` adds Show more                |
| Photos                         | Responsive gallery, supplied alt text, native link to full image                                          |
| Videos and animated GIFs       | Native controls and poster, MP4 preferred over HLS, GIF looping and muted audio; no autoplay              |
| Legacy media                   | `photos` and `video` used when `mediaDetails` is absent or empty                                          |
| Quotes and replies             | Quote card with media, saved parent text when present, Replying to link                                   |
| Metadata                       | UTC timestamp, edited/earlier-version indicator                                                           |
| Actions                        | Saved like and reply counts, X intent links, copy-link button with success/failure status                 |
| Unavailable or sensitive media | Visible failure fallback or explicit reveal button                                                        |

Replacing the snapshot resets media and copy state. Disconnecting or updating the element pauses its videos. Media errors leave an outbound link when attribution is valid. HLS playback depends on native browser support; no HLS player is bundled. Image links open the original resource in a new tab; there is no modal lightbox.

Counts and badges describe the saved snapshot, not live account state. Like, Reply, Follow, and Show more navigate to X; they do not perform account actions inside the embed. Parent and quoted posts are limited to data included in `Tweet`; the component does not fetch a thread.

The react-tweet snapshot contract does not provide poll choices/results, arbitrary website card previews, Community Notes, Spaces playback, or the missing body of a truncated long post. Those cannot be reconstructed from these types and are not invented by the renderer. A skeleton/fetching state is the host's responsibility because this element accepts synchronous snapshots.

## Styling

The optional CSS uses light DOM and low-specificity selectors, scoped by the `data-post-embed="x-post"` attribute set on connection. The same theme applies to default and custom tag names. Without it, content remains readable and selectable. Styles use the `post-embed` cascade layer, nested selectors, and inherited custom properties registered with `@property`. Use `data-root`, `data-author`, `data-body`, `data-text`, `data-footer`, `data-fallback`, `data-avatar`, `data-verified`, `data-label`, `data-media`, `data-media-item`, `data-quoted`, `data-actions`, and `data-sensitive` to style parts. There is no shadow root or `::part` API.

```css
post-embed-x-post {
  --post-embed-background: #172237;
  --post-embed-color: #edf4ff;
  --post-embed-muted-color: #bfd0e8;
  --post-embed-border-color: #475a75;
  --post-embed-link-color: #9cc4ff;
  --post-embed-radius: 1rem;
  --post-embed-padding: 1.25rem;
}
```

Omit the CSS import for an unthemed element. Text direction uses `dir="auto"`. Links are native keyboard-focusable anchors. The component only owns its internal root container and preserves other host children.

Node imports are supported, but server rendering and hydration are not provided. Hosts needing static HTML should render their own fallback inside a direct `div[data-root]` child. On connection, the element reuses that container and replaces its contents; other host children are preserved.
