# @post-embed/elements

## 0.2.0

### Minor Changes

- 543e1e2: Remove engagement controls and the X logo.
- 842ab03: Replace the react-tweet `Tweet` snapshot with the minimal `XPost` model and add `fromSyndication` to convert syndication API data to it.
- 6639360: Redesign the YouTube card: the poster is the card and the title sits over its top edge.

### Patch Changes

- 0646152: Use YouTube's own red play button shape on the YouTube card.
- Updated dependencies [842ab03]
  - @post-embed/types@0.2.0
  - @post-embed/schema@0.2.0

## 0.1.0

### Minor Changes

- 38348ed: Redesign the X post theme.
- 6d61e25: Add `url` and `resolver` properties so an element can load its own snapshot.
- bd5e684: Add the YouTube video element, schema, and type.

### Patch Changes

- d30900f: Treat a lowercase `available` video status from the syndication API as available.
- Updated dependencies [bd5e684]
  - @post-embed/schema@0.1.0
  - @post-embed/types@0.1.0

## 0.0.3

### Patch Changes

- 6cbfe8e: Release latest changes.
- Updated dependencies [6cbfe8e]
  - @post-embed/schema@0.0.3
  - @post-embed/types@0.0.3
