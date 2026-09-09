import type { EnrichedTweet, Tweet } from '@post-embed/types'
import type { StandardSchemaV1 } from '@standard-schema/spec'

import type { RepairedTweet } from './result.js'
import { createSchemas, parseTweet } from './standard-schema.js'
import { EnrichedTweetSchema, TweetSchema } from './tweet/tweet.js'

const raw = createSchemas((input) => parseTweet(TweetSchema, input, false))
const enriched = createSchemas((input) => {
  return parseTweet(EnrichedTweetSchema, input, true)
})

export const tweetSchema: StandardSchemaV1<unknown, Tweet> = raw.schema
export const enrichedTweetSchema: StandardSchemaV1<unknown, EnrichedTweet> =
  enriched.schema
export const tweetWithRepairsSchema: StandardSchemaV1<
  unknown,
  RepairedTweet<Tweet>
> = raw.withRepairsSchema
export const enrichedTweetWithRepairsSchema: StandardSchemaV1<
  unknown,
  RepairedTweet<EnrichedTweet>
> = enriched.withRepairsSchema

export type { RepairedTweet, TweetDataRepair } from './result.js'
