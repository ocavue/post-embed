# @post-embed/schema

## 0.5.1

### Patch Changes

- 7b896f3: Split `XPostMedia` into the named `XPostPhoto` and `XPostVideo` types.
- Updated dependencies [7b896f3]
  - @post-embed/types@0.4.1

## 0.5.0

### Minor Changes

- 256748d: Add `parseXPost`, `parseYouTubeVideo`, and `parseTweet` to return synchronous validation results. Use the helpers in elements and the exporter to remove Promise assertions.

## 0.4.0

### Minor Changes

- 4f4a42a: Add host-controlled media protocols. Share X permalink and media mapping helpers through `@post-embed/schema`.

### Patch Changes

- Updated dependencies [4f4a42a]
  - @post-embed/types@0.4.0

## 0.3.0

### Minor Changes

- 0952baa: Drop the `verified` check and the affiliation `label` from `XPost` authors; the card no longer shows them.

### Patch Changes

- Updated dependencies [0952baa]
  - @post-embed/types@0.3.0

## 0.2.0

### Minor Changes

- 842ab03: Replace the react-tweet `Tweet` snapshot with the minimal `XPost` model and add `fromSyndication` to convert syndication API data to it.

### Patch Changes

- Updated dependencies [842ab03]
  - @post-embed/types@0.2.0

## 0.1.0

### Minor Changes

- bd5e684: Add the YouTube video element, schema, and type.

### Patch Changes

- Updated dependencies [bd5e684]
  - @post-embed/types@0.1.0

## 0.0.3

### Patch Changes

- 6cbfe8e: Release latest changes.
- Updated dependencies [6cbfe8e]
  - @post-embed/types@0.0.3
