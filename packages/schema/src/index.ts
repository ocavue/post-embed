import type { EnrichedTweet, Tweet } from '@post-embed/types'
import type { StandardSchemaV1 } from '@standard-schema/spec'

import { EnrichedTweetSchema, TweetSchema } from './tweet/index.ts'

export const tweetSchema: StandardSchemaV1<unknown, Tweet> = TweetSchema
export const enrichedTweetSchema: StandardSchemaV1<unknown, EnrichedTweet> =
  EnrichedTweetSchema
