# @post-embed/elements

Web components for rendering saved social posts.

```ts
import { registerXPost } from '@post-embed/elements/x'
import type { XPost } from '@post-embed/types'

export function showPost(container: HTMLElement, post: XPost) {
  registerXPost()
  const element = document.createElement('post-embed-x-post')
  element.data = post
  container.append(element)
  return element
}
```

`XPost` is a small snapshot with only what the card renders: the author, the body split into text and link segments, media, an optional quote and reply target, the edit state. Assign a new `XPost` object to `element.data` to update the post, or `null` to clear it. The X card includes its theme inside an open shadow root.

`@post-embed/exporter` produces `XPost` values: `fromSyndication` from the syndication API data X's own embeds use, `observeXTweets` from the GraphQL responses of the x.com page.

## Loading a snapshot by URL

Set `element.url` and `element.resolver` to let the element load its own snapshot. The element calls `resolver(url)` whenever `data` is `null` and both are set, and renders whatever it returns (a snapshot, a promise of one, or `undefined` when nothing was found). Results from a superseded `url` are dropped. While a promise is pending the fallback card carries a `data-pending` attribute. A saved `data` always wins over the fetched snapshot.

```ts
import { fromSyndication } from '@post-embed/exporter/x/syndication'

const element = document.createElement('post-embed-x-post')
element.resolver = async (url) => {
  const id = new URL(url).pathname.split('/').at(-1)
  const response = await fetch(`/api/tweet/${id}`)
  return response.ok ? fromSyndication(await response.json()) : undefined
}
element.url = 'https://x.com/jack/status/20'
```

The syndication API X's own embeds read from does not allow cross-origin requests, so `resolver` for X posts usually goes through your server.

## YouTube video

```ts
import '@post-embed/elements/youtube/theme.css'

import { registerYouTubeVideo } from '@post-embed/elements/youtube'
import type { YouTubeVideo } from '@post-embed/types'

export function showVideo(container: HTMLElement, url: string) {
  registerYouTubeVideo()
  const element = document.createElement('post-embed-youtube-video')
  element.resolver = async (url) => {
    const response = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
    )
    if (!response.ok) return
    return { url, ...(await response.json()) } as YouTubeVideo
  }
  element.url = url
  container.append(element)
  return element
}
```

The snapshot is the YouTube oEmbed response plus the video `url`; YouTube's oEmbed endpoint allows cross-origin requests, so `resolver` can call it directly, or assign a saved snapshot to `element.data` instead. The element renders a card with the poster, title, channel, and a "Watch on YouTube" link, and never creates an iframe unless you set `playback="inline"` (as an attribute or `element.playback = 'inline'`). In inline mode the poster becomes a play button, and clicking it swaps in the `youtube-nocookie.com` player. The poster loads from the saved `thumbnail_url`; point it at your own copy if the page must not contact Google's image CDN.

See the [playground](../../apps/playground) for examples.

## X card styling

The X card uses a soft background, 12px corners, a faint 1px border, and a 28px author avatar. Its shadow root isolates the card from page selectors, including global paragraph margins, image sizing, and link styles. An internal reset establishes typography independently of the page font. Set `color-scheme: dark` on the element or an ancestor to use the dark palette.

The following CSS variables inherit through the shadow boundary:

| Variable                    | Controls                     |
| --------------------------- | ---------------------------- |
| `--post-embed-color`        | Text color                   |
| `--post-embed-background`   | Card background              |
| `--post-embed-border-color` | Border color                 |
| `--post-embed-radius`       | Card corner radius           |
| `--post-embed-padding`      | Card padding                 |
| `--post-embed-muted-color`  | Handle and footer color      |
| `--post-embed-link-color`   | Link and focus outline color |

The existing `@post-embed/elements/x/theme.css` import remains available, but is no longer required. External selectors targeting internal `data-*` elements no longer apply. Use the variables for theming and `element.shadowRoot` when inspecting rendered content. Other light-DOM children are preserved through a default slot; a direct `div[data-root]` server fallback is moved into the shadow root and replaced when the element connects.

Container styles such as width, clipping, opacity, and transforms still affect the whole element. Shadow DOM does not isolate those ancestor effects. YouTube continues to use its existing light-DOM theme.
