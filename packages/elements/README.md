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

Assign a new raw `Tweet` object to update, or `null` to clear. Data is a property, never a JSON attribute. In-place mutations do not trigger updates. The element validates with `tweetSchema`, copies the result, and runs the locally copied upstream `enrichTweet` implementation. It does not change the host's snapshot. `EnrichedTweet` is not an accepted input.

Invalid data displays “Post data unavailable”. Empty visible text displays “No text available”. Schema defaults do not prove completeness: a default empty display range can hide nonempty raw text. Upstream range trimming and media entity omission are retained. Truncated snapshots cannot recover missing text. No requests are made until the reader follows a link.

Normal text entities are decoded once with `entities`, then rendered as text by Lit. Links accept absolute HTTP(S) destinations without credentials. Unsafe destinations stay readable as text. External links open in a new tab with `noopener noreferrer`.

## Styling

The optional CSS uses light DOM and low-specificity selectors. Without it, content remains readable and selectable. Use the `root`, `author`, `body`, and `footer` values of `data-post-part` to style parts. There is no shadow root or `::part` API.

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

Node imports are supported, but server rendering and hydration are not provided. Hosts needing static HTML should render their own fallback.
