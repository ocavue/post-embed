# @post-embed/schema

Normalize raw `Tweet` and `EnrichedTweet` data to the types in `@post-embed/types` through [Standard Schema V1](https://github.com/standard-schema/standard-schema).

```ts
import { TweetSchema } from '@post-embed/schema'

const result = await TweetSchema['~standard'].validate(input)
if (result.issues) {
  // Handle validation failure.
} else {
  const tweet = result.value
}
```

Use `EnrichedTweetSchema` for enriched input.
