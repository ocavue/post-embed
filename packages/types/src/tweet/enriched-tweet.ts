// Source: https://github.com/vercel/react-tweet/blob/react-tweet@3.3.1/packages/react-tweet/src/utils.ts

import type {
  HashtagEntity,
  Indices,
  MediaEntity,
  SymbolEntity,
  UrlEntity,
  UserMentionEntity,
} from './entities.js'
import type { QuotedTweet, Tweet } from './tweet.js'

type TextEntity = {
  indices: Indices
  type: 'text'
}

type Entity = {
  text: string
} & (
  | TextEntity
  | (HashtagEntity & { type: 'hashtag'; href: string })
  | (UserMentionEntity & { type: 'mention'; href: string })
  | (UrlEntity & { type: 'url'; href: string })
  | (MediaEntity & { type: 'media'; href: string })
  | (SymbolEntity & { type: 'symbol'; href: string })
)

export type EnrichedTweet = Omit<Tweet, 'entities' | 'quoted_tweet'> & {
  url: string
  user: {
    url: string
    follow_url: string
  }
  like_url: string
  reply_url: string
  in_reply_to_url?: string
  entities: Entity[]
  quoted_tweet?: EnrichedQuotedTweet
}

export type EnrichedQuotedTweet = Omit<QuotedTweet, 'entities'> & {
  url: string
  entities: Entity[]
}
