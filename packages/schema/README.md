# @post-embed/schema

Validate post snapshots against the types in `@post-embed/types` through [Standard Schema V1](https://github.com/standard-schema/standard-schema). Missing or invalid fields get type defaults and unknown fields are dropped.

```ts
import { parseXPost } from '@post-embed/schema'

const result = parseXPost(input)
if (result.issues) {
  // Handle validation failure.
} else {
  const post = result.value
}
```

`XPostSchema` validates the `XPost` snapshot that `@post-embed/elements` renders, `YouTubeVideoSchema` the YouTube one, and `TweetSchema` the raw syndication API `Tweet` that `@post-embed/exporter/x/syndication` converts from.

`parseXPost`, `parseYouTubeVideo`, and `parseTweet` accept `unknown` and return a synchronous Standard Schema result: `{ value }` on success or `{ issues }` on failure. They apply the same defaults and unknown-field stripping as the schemas, without requiring `await` or a Promise assertion. Validation failures are returned rather than thrown.

The schema objects remain exported for Standard Schema integrations.
