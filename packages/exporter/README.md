# @post-embed/exporter

Turns X post data into the `XPost` snapshot that `@post-embed/elements` renders: either from the GraphQL responses the x.com page already receives, or from a syndication API response.

## `@post-embed/exporter/x/syndication`

Convert a response of X's syndication API (the data behind X's own embeds, also what react-tweet's `fetchTweet` returns) to `XPost`:

```ts
import { fromSyndication } from '@post-embed/exporter/x/syndication'

const response = await fetch(`https://react-tweet.vercel.app/api/tweet/${id}`)
const { data } = await response.json()
const post = fromSyndication(data) // XPost | undefined
```

`fromSyndication` accepts any value, returns `undefined` for anything that is not a tweet (a tombstone, an empty object), and never keeps fields the card does not render.

## `@post-embed/exporter/x`

Run in the page's own JavaScript context (a MAIN world content script or a userscript) before the page's scripts start:

```ts
import { observeXTweets } from '@post-embed/exporter/x'

const observer = observeXTweets()
observer.subscribe((entry) => console.log(entry.post.id, entry.protected))
const entry = await observer.waitFor('20', { timeoutMs: 5000 })
```

`observeXTweets` wraps `fetch` and `XMLHttpRequest.prototype.open`, copies responses of the known tweet operations, finds every tweet object in them, converts each one to `XPost` with `toXPost`, and keeps the newest 200 by id. `entry.protected` is true when the author limits who can see their posts. It only reads: no request is sent, no request or response is changed.

## `@post-embed/exporter/x/bridge`

Passes posts from the MAIN world to an extension's isolated content script:

In the MAIN world:

```ts
import { exposeXTweets } from '@post-embed/exporter/x/bridge'

exposeXTweets(observer)
```

In the ISOLATED world:

```ts
import { requestXTweet } from '@post-embed/exporter/x/bridge'

const entry = await requestXTweet('20')
```

`createXTweetClient` keeps one connection open for repeated `get` calls and broadcast entries. The bridge is a [birpc](https://github.com/antfu-collective/birpc) channel over `window.postMessage`, filtered to same-window, same-origin messages; answers are re-validated with `XPostSchema` on the isolated side.
