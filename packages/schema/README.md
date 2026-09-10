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

Use `enrichedTweetSchema` for enriched input. Both exports use Valibot's native Standard Schema implementation, with vendor `valibot`. The public TypeScript contract is Standard Schema; there are no repair reports or parsing options.

## Defaults

Missing or invalid values use defaults declared directly in the field schemas:

| Type            | Default                                                                             |
| --------------- | ----------------------------------------------------------------------------------- |
| string          | `''`, including IDs, text, dates, and URLs                                          |
| finite number   | `0`, also used for NaN and Infinity                                                 |
| boolean         | `false`                                                                             |
| array           | `[]`                                                                                |
| numeric pair    | `[0, 0]` for invalid index containers; `[1, 1]` for invalid aspect-ratio containers |
| literal         | The declared literal                                                                |
| enum            | An explicit member, such as `Circle` for avatar shape                               |
| required object | Must be present and pass `v.object`; fields may have defaults                       |
| optional field  | Missing or undefined stays optional; supplied values use the field's defaults       |

Numeric pairs use native `v.tuple` parsing: missing or invalid elements become 0, and extra elements are removed. For example, `[1]` becomes `[1, 0]` and `[1, 2, 3]` becomes `[1, 2]`. An empty array becomes `[0, 0]`; it does not trigger the whole aspect-ratio fallback.

Valid strings, finite numbers, and booleans are preserved. There is no ID/date/URL format validation, positive-number restriction, range check, or scalar coercion. Unknown object keys are removed. Unknown verification badges become `undefined`.

A recognized media or enriched entity discriminator selects its branch, whose fields receive defaults. An unknown discriminator or an item missing a required object makes the **whole containing array** fall back to `[]`. Items are not individually filtered. Video content types default to `video/mp4` when invalid; valid HLS content types are preserved.

Enriched entities default to `[]` and URLs to `''`. There is no text reconstruction, URL generation, aspect-ratio calculation, or other enrichment.

Required objects such as `user` and `edit_control` must be present. `{}` and `null` root inputs fail validation. Optional objects may be omitted, but supplied invalid objects fail validation. For example, `{ user: {}, edit_control: {} }` succeeds with field defaults; `{ user: null, edit_control: {} }` fails. Object failures are returned as Standard Schema issues, not thrown exceptions. Successful validation means the output has the expected structure, not that a tweet exists or has usable content. Consumers decide what to display when text, IDs, URLs, dimensions, or collections are empty.

Inputs are JSON-shaped data. Parsing does not mutate them, default arrays are fresh per call, and parsing the output again preserves it. Standard issues retain Valibot's native messages and paths.

## Type correspondence

Tweet definition files mirror `packages/types/src/tweet/`. Shared `NumberSchema`, `StringSchema`, and `looseArray` live in `src/primitives.ts` to avoid duplicating fallback expressions. Each named type `X` has an `XSchema` in the same relative file, with matching module export visibility. For example, `IndicesSchema` lives in `tweet/entities.ts`, `TweetEditControlSchema` in `tweet/edit.ts`, and enriched schemas in `tweet/enriched-tweet.ts`. Anonymous nested types have inline schemas.

Each definition file has a neighboring `*.test-d.ts` file, with an individual output-type check for every exported schema. Type tests import their counterparts through `@post-embed/types/internal/...`; relative imports under `src/` use `.ts` extensions. Tests also check file/name correspondence. Runtime tests and their fixtures remain under `src/`; they are test support, not mirrored type definitions.

## Development

```sh
pnpm --filter @post-embed/schema test
pnpm --filter @post-embed/schema build
```

Runtime tests cover defaults, union selection, optional fields, and input/output independence. Type tests compare naturally inferred schema outputs with the independent `@post-embed/types` declarations. The schemas are based on the types in `@post-embed/types`.
