# @post-embed/schema

Validate and repair raw `Tweet` and `EnrichedTweet` data through [Standard Schema V1](https://github.com/standard-schema/standard-schema). The output types come from `@post-embed/types`; Valibot is an internal implementation detail.

```ts
import { tweetSchema } from '@post-embed/schema'

async function readTweet(input: unknown) {
  const result = await tweetSchema['~standard'].validate(input)
  if (result.issues) {
    return { issues: result.issues }
  }
  return { tweet: result.value }
}
```

Use `enrichedTweetSchema` for an enriched object. Choose the input representation explicitly; the schemas do not fetch tweets or run full enrichment.

For repair details, use `tweetWithRepairsSchema` or `enrichedTweetWithRepairsSchema`. Their Standard Schema success value is `{ data, repairs }`. All four schemas share the same validation and repair policies. Issues indicate failure; successful repairs are not reported as issues.

## Repair policy

- Missing or null collections become fresh empty arrays. Missing raw entities become an object containing empty entity arrays.
- Invalid collection containers fail validation. Invalid individual raw entities or media items are dropped, preserving valid siblings and recording their original paths.
- Missing or invalid enriched entities fall back to the visible raw text using Unicode code point ranges. Valid empty arrays are preserved.
- Missing display ranges are derived from the text. Supplied invalid ranges are rejected.
- Missing counts and verification/edit flags use zero/false compatibility defaults. Missing edit controls disable editing. These defaults are reported and are not evidence of the original values.
- Missing enriched action URLs are derived from validated IDs and handles. Existing string URLs are preserved.
- Invalid optional fields and unrecoverable parent/quoted tweets are omitted with a repair record.
- Unknown fields are removed with a repair record. The output is not a lossless copy of the API response.

Tweet identity, author identity, text, and creation time must be present and valid. Empty text is valid; an empty object or tombstone is not a tweet. Numeric tweet IDs are rejected because converting them to strings cannot recover lost precision.

Parsers do not mutate inputs or share mutable output objects between calls. Parsing normalized data again yields the same data with no further repairs. Errors expose only standard messages and paths, not raw validation inputs.

The inputs are JSON-shaped data. URL fields are checked as strings, not as network permissions or rendering sanitization. Empty video variants satisfy the data type but do not guarantee playback. Consumers must handle empty collections and their own resource/rendering policies.

## Development

```sh
pnpm --filter @post-embed/schema test
pnpm --filter @post-embed/schema build
```

Runtime tests cover compatibility repairs and failures; type tests compare the naturally inferred canonical schemas with the independently maintained `@post-embed/types` declarations. Source comments identify the `react-tweet@3.3.1` definitions and enrichment rules used as references.
