import type { EnrichedTweet, Tweet } from '@post-embed/types'
import type { StandardSchemaV1 } from '@standard-schema/spec'

import { EnrichedTweetSchema, TweetSchema } from './tweet/index.ts'

export {
  // FIXME: do NOT rename TweetSchema to tweetSchema. Just keep TweetSchema and EnrichedTweetSchema
  TweetSchema as tweetSchema,
  EnrichedTweetSchema as enrichedTweetSchema,
}

// 1. let's remove parseTweet and parseEnrichedTweet from this public API REVIEW FIXME
// These schemas are synchronous; Valibot's Standard Schema signature also permits promises.
export function parseTweet(input: unknown): StandardSchemaV1.Result<Tweet> {
  return TweetSchema['~standard'].validate(
    input,
  ) as StandardSchemaV1.Result<Tweet>
}

export function parseEnrichedTweet(
  input: unknown,
): StandardSchemaV1.Result<EnrichedTweet> {
  return EnrichedTweetSchema['~standard'].validate(
    input,
  ) as StandardSchemaV1.Result<EnrichedTweet>
}
