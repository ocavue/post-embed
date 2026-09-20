# @post-embed/types

## 0.5.0

### Minor Changes

- a65e845: Accept quotes without thread metadata and return `{ value }` or `{ issues }` from `fromSyndication` instead of silently returning `undefined` on invalid data.

## 0.4.1

### Patch Changes

- 7b896f3: Split `XPostMedia` into the named `XPostPhoto` and `XPostVideo` types.

## 0.4.0

### Minor Changes

- 4f4a42a: Add host-controlled media protocols. Share X permalink and media mapping helpers through `@post-embed/schema`.

## 0.3.0

### Minor Changes

- 0952baa: Drop the `verified` check and the affiliation `label` from `XPost` authors; the card no longer shows them.

## 0.2.0

### Minor Changes

- 842ab03: Replace the react-tweet `Tweet` snapshot with the minimal `XPost` model and add `fromSyndication` to convert syndication API data to it.

## 0.1.0

### Minor Changes

- bd5e684: Add the YouTube video element, schema, and type.

## 0.0.3

### Patch Changes

- 6cbfe8e: Release latest changes.
