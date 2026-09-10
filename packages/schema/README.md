# @post-embed/schema

Normalize raw `Tweet` and `EnrichedTweet` data to the types in `@post-embed/types` through [Standard Schema V1](https://github.com/standard-schema/standard-schema).

```ts
import { tweetSchema } from '@post-embed/schema'

const result = await tweetSchema['~standard'].validate(input)
if (result.issues) {
  // Handle validation failure.
} else {
  const tweet = result.value
}
```

Use `enrichedTweetSchema` for enriched input.

For synchronous validation, use `parseTweet(input)` or `parseEnrichedTweet(input)`. Both return a `StandardSchemaV1.Result`: read `value` on success or `issues` on failure. No Valibot import or `await` is needed.
