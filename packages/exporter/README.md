# @post-embed/exporter

Reads X posts from the GraphQL responses the x.com page already receives and turns them into the `Tweet` shape that `@post-embed/elements` renders. It only reads: no request is sent, no request or response is changed.

## `@post-embed/exporter/x`

Run in the page's own JavaScript context (a MAIN world content script or a userscript) before the page's scripts start:

```ts
import { observeXTweets } from '@post-embed/exporter/x'

const observer = observeXTweets()
observer.subscribe((entry) => console.log(entry.tweet.id_str, entry.protected))
const entry = await observer.waitFor('20', { timeoutMs: 5000 })
```

`observeXTweets` wraps `fetch` and `XMLHttpRequest.prototype.open`, copies responses of the known tweet operations, finds every tweet object in them, normalizes each one with `TweetSchema`, and keeps the newest 200 by id. `entry.protected` is true when the author limits who can see their posts.

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

`createXTweetClient` keeps one connection open for repeated `get` calls and broadcast entries. The bridge is a [birpc](https://github.com/antfu-collective/birpc) channel over `window.postMessage`, filtered to same-window, same-origin messages; answers are re-validated on the isolated side.
