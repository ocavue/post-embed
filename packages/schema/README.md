# @post-embed/schema

Validate post snapshots against the types in `@post-embed/types` through [Standard Schema V1](https://github.com/standard-schema/standard-schema). Missing or invalid fields get type defaults and unknown fields are dropped.

```ts
import { XPostSchema } from '@post-embed/schema'

const result = await XPostSchema['~standard'].validate(input)
if (result.issues) {
  // Handle validation failure.
} else {
  const post = result.value
}
```

`XPostSchema` validates the `XPost` snapshot that `@post-embed/elements` renders, `YouTubeVideoSchema` the YouTube one, and `TweetSchema` the raw syndication API `Tweet` that `@post-embed/exporter/x/syndication` converts from.
