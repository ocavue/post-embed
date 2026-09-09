import type { EnrichedTweet, Tweet } from '@post-embed/types'
import type { StandardSchemaV1 } from '@standard-schema/spec'
import type * as v from 'valibot'
import { expectTypeOf, test } from 'vitest'

import type * as editTypes from '../../../types/src/tweet/edit.js'
import type * as enrichedTweetTypes from '../../../types/src/tweet/enriched-tweet.js'
import type * as entitiesTypes from '../../../types/src/tweet/entities.js'
import type * as mediaTypes from '../../../types/src/tweet/media.js'
import type * as photoTypes from '../../../types/src/tweet/photo.js'
import type * as tweetTypes from '../../../types/src/tweet/tweet.js'
import type * as userTypes from '../../../types/src/tweet/user.js'
import type * as videoTypes from '../../../types/src/tweet/video.js'
import type { enrichedTweetSchema, tweetSchema } from '../index.js'

import type { TweetEditControlSchema } from './edit.js'
import type {
  EnrichedTweetSchema,
  EnrichedQuotedTweetSchema,
} from './enriched-tweet.js'
import type {
  IndicesSchema,
  HashtagEntitySchema,
  UserMentionEntitySchema,
  MediaEntitySchema,
  UrlEntitySchema,
  SymbolEntitySchema,
  TweetEntitiesSchema,
} from './entities.js'
import type {
  RGBSchema,
  RectSchema,
  SizeSchema,
  VideoInfoSchema,
  MediaPhotoSchema,
  MediaAnimatedGifSchema,
  MediaVideoSchema,
  MediaDetailsSchema,
} from './media.js'
import type { TweetPhotoSchema } from './photo.js'
import type {
  TweetBaseSchema,
  TweetSchema,
  TweetParentSchema,
  QuotedTweetSchema,
} from './tweet.js'
import type {
  HighlightedBadgeSchema,
  UserHighlightedLabelSchema,
  TweetUserSchema,
} from './user.js'
import type { TweetVideoSchema } from './video.js'

test('edit.ts schemas match their types', () => {
  expectTypeOf<
    v.InferOutput<typeof TweetEditControlSchema>
  >().toEqualTypeOf<editTypes.TweetEditControl>()
})

test('enriched-tweet.ts schemas match their types', () => {
  expectTypeOf<
    v.InferOutput<typeof EnrichedTweetSchema>
  >().toEqualTypeOf<enrichedTweetTypes.EnrichedTweet>()
  expectTypeOf<
    v.InferOutput<typeof EnrichedQuotedTweetSchema>
  >().toEqualTypeOf<enrichedTweetTypes.EnrichedQuotedTweet>()
})

test('entities.ts schemas match their types', () => {
  expectTypeOf<
    v.InferOutput<typeof IndicesSchema>
  >().toEqualTypeOf<entitiesTypes.Indices>()
  expectTypeOf<
    v.InferOutput<typeof HashtagEntitySchema>
  >().toEqualTypeOf<entitiesTypes.HashtagEntity>()
  expectTypeOf<
    v.InferOutput<typeof UserMentionEntitySchema>
  >().toEqualTypeOf<entitiesTypes.UserMentionEntity>()
  expectTypeOf<
    v.InferOutput<typeof MediaEntitySchema>
  >().toEqualTypeOf<entitiesTypes.MediaEntity>()
  expectTypeOf<
    v.InferOutput<typeof UrlEntitySchema>
  >().toEqualTypeOf<entitiesTypes.UrlEntity>()
  expectTypeOf<
    v.InferOutput<typeof SymbolEntitySchema>
  >().toEqualTypeOf<entitiesTypes.SymbolEntity>()
  expectTypeOf<
    v.InferOutput<typeof TweetEntitiesSchema>
  >().toEqualTypeOf<entitiesTypes.TweetEntities>()
})

test('media.ts schemas match their types', () => {
  expectTypeOf<
    v.InferOutput<typeof RGBSchema>
  >().toEqualTypeOf<mediaTypes.RGB>()
  expectTypeOf<
    v.InferOutput<typeof RectSchema>
  >().toEqualTypeOf<mediaTypes.Rect>()
  expectTypeOf<
    v.InferOutput<typeof SizeSchema>
  >().toEqualTypeOf<mediaTypes.Size>()
  expectTypeOf<
    v.InferOutput<typeof VideoInfoSchema>
  >().toEqualTypeOf<mediaTypes.VideoInfo>()
  expectTypeOf<
    v.InferOutput<typeof MediaPhotoSchema>
  >().toEqualTypeOf<mediaTypes.MediaPhoto>()
  expectTypeOf<
    v.InferOutput<typeof MediaAnimatedGifSchema>
  >().toEqualTypeOf<mediaTypes.MediaAnimatedGif>()
  expectTypeOf<
    v.InferOutput<typeof MediaVideoSchema>
  >().toEqualTypeOf<mediaTypes.MediaVideo>()
  expectTypeOf<
    v.InferOutput<typeof MediaDetailsSchema>
  >().toEqualTypeOf<mediaTypes.MediaDetails>()
})

test('photo.ts schemas match their types', () => {
  expectTypeOf<
    v.InferOutput<typeof TweetPhotoSchema>
  >().toEqualTypeOf<photoTypes.TweetPhoto>()
})

test('tweet.ts schemas match their types', () => {
  expectTypeOf<
    v.InferOutput<typeof TweetBaseSchema>
  >().toEqualTypeOf<tweetTypes.TweetBase>()
  expectTypeOf<
    v.InferOutput<typeof TweetSchema>
  >().toEqualTypeOf<tweetTypes.Tweet>()
  expectTypeOf<
    v.InferOutput<typeof TweetParentSchema>
  >().toEqualTypeOf<tweetTypes.TweetParent>()
  expectTypeOf<
    v.InferOutput<typeof QuotedTweetSchema>
  >().toEqualTypeOf<tweetTypes.QuotedTweet>()
})

test('user.ts schemas match their types', () => {
  expectTypeOf<
    v.InferOutput<typeof HighlightedBadgeSchema>
  >().toEqualTypeOf<userTypes.HighlightedBadge>()
  expectTypeOf<
    v.InferOutput<typeof UserHighlightedLabelSchema>
  >().toEqualTypeOf<userTypes.UserHighlightedLabel>()
  expectTypeOf<
    v.InferOutput<typeof TweetUserSchema>
  >().toEqualTypeOf<userTypes.TweetUser>()
})

test('video.ts schemas match their types', () => {
  expectTypeOf<
    v.InferOutput<typeof TweetVideoSchema>
  >().toEqualTypeOf<videoTypes.TweetVideo>()
})

test('public schemas accept unknown and expose only the Standard Schema contract', () => {
  expectTypeOf<
    StandardSchemaV1.InferInput<typeof tweetSchema>
  >().toEqualTypeOf<unknown>()
  expectTypeOf<
    StandardSchemaV1.InferInput<typeof enrichedTweetSchema>
  >().toEqualTypeOf<unknown>()
  expectTypeOf<
    StandardSchemaV1.InferOutput<typeof tweetSchema>
  >().toEqualTypeOf<Tweet>()
  expectTypeOf<
    StandardSchemaV1.InferOutput<typeof enrichedTweetSchema>
  >().toEqualTypeOf<EnrichedTweet>()
})
