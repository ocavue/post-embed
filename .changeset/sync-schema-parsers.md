---
"@post-embed/schema": minor
"@post-embed/elements": patch
"@post-embed/exporter": patch
---

Add `parseXPostSchema`, `parseYouTubeVideoSchema`, and `parseTweetSchema` to return synchronous validation results. Use the helpers in elements and the exporter to remove Promise assertions.
