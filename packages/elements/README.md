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

## YouTube video

```ts
import '@post-embed/elements/youtube/theme.css'

import { registerYouTubeVideo } from '@post-embed/elements/youtube'
import type { YouTubeVideo } from '@post-embed/types'

export async function showVideo(container: HTMLElement, url: string) {
  registerYouTubeVideo()
  const response = await fetch(
    `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
  )
  const element = document.createElement('post-embed-youtube-video')
  element.data = { url, ...(await response.json()) } as YouTubeVideo
  container.append(element)
  return element
}
```

The snapshot is the YouTube oEmbed response plus the video `url`. The element renders a card with the poster, title, channel, and a "Watch on YouTube" link, and never creates an iframe unless you set `playback="inline"` (as an attribute or `element.playback = 'inline'`). In inline mode the poster becomes a play button, and clicking it swaps in the `youtube-nocookie.com` player. The poster loads from the saved `thumbnail_url`; point it at your own copy if the page must not contact Google's image CDN.

See the [playground](../../apps/playground) for examples.
