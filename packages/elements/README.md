# @post-embed/elements

Web components for rendering saved social posts.

```ts
import '@post-embed/elements/x/theme.css'

import { registerXPost } from '@post-embed/elements/x'
import type { Tweet } from '@post-embed/types'

export function showTweet(container: HTMLElement, tweet: Tweet) {
  registerXPost()
  const element = document.createElement('post-embed-x-post')
  element.data = tweet
  container.append(element)
  return element
}
```

Assign a new `Tweet` object to `element.data` to update the post, or `null` to clear it. The theme import is optional.

Each snapshot update replaces the rendered card, resetting media playback and sensitive-media reveals. Copy feedback and media interactions update their existing nodes through native DOM APIs. Disconnecting the element pauses its videos; reconnecting renders the latest snapshot. The marked root container and other host children are retained.

See the [playground](../../apps/playground) for examples.
