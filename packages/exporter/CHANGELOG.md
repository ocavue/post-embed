# @post-embed/exporter

## 0.4.1

### Patch Changes

- 256748d: Add `parseXPost`, `parseYouTubeVideo`, and `parseTweet` to return synchronous validation results. Use the helpers in elements and the exporter to remove Promise assertions.
- Updated dependencies [256748d]
  - @post-embed/schema@0.5.0

## 0.4.0

### Minor Changes

- 4f4a42a: Add host-controlled media protocols. Share X permalink and media mapping helpers through `@post-embed/schema`.

### Patch Changes

- Updated dependencies [4f4a42a]
  - @post-embed/types@0.4.0
  - @post-embed/schema@0.4.0

## 0.3.0

### Minor Changes

- 0952baa: Drop the `verified` check and the affiliation `label` from `XPost` authors; the card no longer shows them.

### Patch Changes

- Updated dependencies [0952baa]
  - @post-embed/types@0.3.0
  - @post-embed/schema@0.3.0

## 0.2.0

### Minor Changes

- 842ab03: Replace the react-tweet `Tweet` snapshot with the minimal `XPost` model and add `fromSyndication` to convert syndication API data to it.

### Patch Changes

- Updated dependencies [842ab03]
  - @post-embed/types@0.2.0
  - @post-embed/schema@0.2.0

## 0.1.0

### Minor Changes

- a67319a: Add the X exporter that reads posts from the page's own GraphQL responses.

### Patch Changes

- Updated dependencies [bd5e684]
  - @post-embed/schema@0.1.0
  - @post-embed/types@0.1.0
