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

See the [playground](../../apps/playground) for examples.
