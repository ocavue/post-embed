# @post-embed/elements

Text-only snapshot elements. The X element renders author text, body links, and a permalink using saved `Tweet` data. It does not fetch, refresh, or persist data, or render avatars, media, quotes, counts, or timestamps.

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

Assign a new raw `Tweet` object to update, or `null` to show the unavailable fallback. Data is a property, never a JSON attribute. In-place mutations do not trigger updates. The element validates synchronously with `parseTweet`, copies the result, and runs the locally copied upstream `enrichTweet` implementation. It does not change the host's snapshot. `EnrichedTweet` is not an accepted input.

Null or invalid data displays an unavailable card. Invalid data also logs its validation issues to `console.error`. Empty visible text stays empty, with available attribution retained. Schema defaults do not prove completeness: a default empty display range can hide nonempty raw text. Upstream range trimming and media entity omission are retained. Truncated snapshots cannot recover missing text. No requests are made until the reader follows a link.

Normal text entities are decoded once with `entities`, then rendered as text by Lit. Links accept absolute HTTP(S) destinations without credentials. Unsafe destinations stay readable as text. External links open in a new tab with `noopener noreferrer`.

## Styling

The optional CSS uses light DOM and low-specificity selectors, scoped by the `data-post-embed="x-post"` attribute set on connection. The same theme applies to default and custom tag names. Without it, content remains readable and selectable. Styles use the `post-embed` cascade layer, nested selectors, and inherited custom properties registered with `@property`. Use `data-root`, `data-author`, `data-body`, `data-text`, `data-footer`, and `data-fallback` to style parts. There is no shadow root or `::part` API.

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
