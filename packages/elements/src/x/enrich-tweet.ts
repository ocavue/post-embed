import type { EnrichedTweet, Tweet } from '@post-embed/types'
import type {
  HashtagEntity,
  SymbolEntity,
  Indices,
  UserMentionEntity,
  UrlEntity,
  MediaEntity,
} from '@post-embed/types/internal/tweet/entities'
import type { TweetBase } from '@post-embed/types/internal/tweet/tweet'

/** @see https://github.com/vercel/react-tweet/blob/react-tweet@3.3.1/packages/react-tweet/src/utils.ts */
function getTweetUrl(tweet: TweetBase) {
  return `https://x.com/${tweet.user.screen_name}/status/${tweet.id_str}`
}

/** @see https://github.com/vercel/react-tweet/blob/react-tweet@3.3.1/packages/react-tweet/src/utils.ts */
function getUserUrl(usernameOrTweet: string | TweetBase) {
  return `https://x.com/${
    typeof usernameOrTweet === 'string'
      ? usernameOrTweet
      : usernameOrTweet.user.screen_name
  }`
}

/** @see https://github.com/vercel/react-tweet/blob/react-tweet@3.3.1/packages/react-tweet/src/utils.ts */
function getLikeUrl(tweet: TweetBase) {
  return `https://x.com/intent/like?tweet_id=${tweet.id_str}`
}

/** @see https://github.com/vercel/react-tweet/blob/react-tweet@3.3.1/packages/react-tweet/src/utils.ts */
function getReplyUrl(tweet: TweetBase) {
  return `https://x.com/intent/tweet?in_reply_to=${tweet.id_str}`
}

/** @see https://github.com/vercel/react-tweet/blob/react-tweet@3.3.1/packages/react-tweet/src/utils.ts */
function getFollowUrl(tweet: TweetBase) {
  return `https://x.com/intent/follow?screen_name=${tweet.user.screen_name}`
}

/** @see https://github.com/vercel/react-tweet/blob/react-tweet@3.3.1/packages/react-tweet/src/utils.ts */
function getHashtagUrl(hashtag: HashtagEntity) {
  return `https://x.com/hashtag/${hashtag.text}`
}

/** @see https://github.com/vercel/react-tweet/blob/react-tweet@3.3.1/packages/react-tweet/src/utils.ts */
function getSymbolUrl(symbol: SymbolEntity) {
  return `https://x.com/search?q=%24${symbol.text}`
}

/** @see https://github.com/vercel/react-tweet/blob/react-tweet@3.3.1/packages/react-tweet/src/utils.ts */
function getInReplyToUrl(tweet: Tweet) {
  return `https://x.com/${tweet.in_reply_to_screen_name}/status/${tweet.in_reply_to_status_id_str}`
}

type TextEntity = {
  indices: Indices
  type: 'text'
}

type TweetEntity =
  HashtagEntity | UserMentionEntity | UrlEntity | MediaEntity | SymbolEntity

type EntityWithType =
  | TextEntity
  | (HashtagEntity & { type: 'hashtag' })
  | (UserMentionEntity & { type: 'mention' })
  | (UrlEntity & { type: 'url' })
  | (MediaEntity & { type: 'media' })
  | (SymbolEntity & { type: 'symbol' })

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

/** @see https://github.com/vercel/react-tweet/blob/react-tweet@3.3.1/packages/react-tweet/src/utils.ts */
function getEntities(tweet: TweetBase): Entity[] {
  const textMap = Array.from(tweet.text)
  const result: EntityWithType[] = [
    { indices: tweet.display_text_range, type: 'text' },
  ]

  const { entities } = tweet
  if (entities) {
    addEntities(result, 'hashtag', entities.hashtags)
    addEntities(result, 'mention', entities.user_mentions)
    addEntities(result, 'url', entities.urls)
    addEntities(result, 'symbol', entities.symbols)
    addEntities(result, 'media', entities.media)
  }
  fixRange(tweet, result)

  return result.map((entity) => {
    const text = textMap.slice(entity.indices[0], entity.indices[1]).join('')
    switch (entity.type) {
      case 'hashtag':
        return Object.assign(entity, { href: getHashtagUrl(entity), text })
      case 'mention':
        return Object.assign(entity, {
          href: getUserUrl(entity.screen_name),
          text,
        })
      case 'url':
      case 'media':
        return Object.assign(entity, {
          href: entity.expanded_url,
          text: entity.display_url,
        })
      case 'symbol':
        return Object.assign(entity, { href: getSymbolUrl(entity), text })
      default:
        return Object.assign(entity, { text })
    }
  })
}

/** @see https://github.com/vercel/react-tweet/blob/react-tweet@3.3.1/packages/react-tweet/src/utils.ts */
function addEntities(
  result: EntityWithType[],
  type: EntityWithType['type'],
  entities?: TweetEntity[],
) {
  if (!entities?.length) return

  for (const entity of entities) {
    for (const [index, item] of result.entries()) {
      if (
        item.indices[0] > entity.indices[0] ||
        item.indices[1] < entity.indices[1]
      ) {
        continue
      }

      const items = [{ ...entity, type }] as EntityWithType[]

      if (item.indices[0] < entity.indices[0]) {
        items.unshift({
          indices: [item.indices[0], entity.indices[0]],
          type: 'text',
        })
      }
      if (item.indices[1] > entity.indices[1]) {
        items.push({
          indices: [entity.indices[1], item.indices[1]],
          type: 'text',
        })
      }

      result.splice(index, 1, ...items)
      break // Break out of the loop to avoid iterating over the new items
    }
  }
}

/**
 * Update display_text_range to work w/ Array.from
 * Array.from is unicode aware, unlike string.slice()
 * @see https://github.com/vercel/react-tweet/blob/react-tweet@3.3.1/packages/react-tweet/src/utils.ts
 */
function fixRange(tweet: TweetBase, entities: EntityWithType[]) {
  const media = tweet.entities?.media
  if (media?.length && media[0].indices[0] < tweet.display_text_range[1]) {
    tweet.display_text_range[1] = media[0].indices[0]
  }
  const lastEntity = entities.at(-1)
  if (lastEntity && lastEntity.indices[1] > tweet.display_text_range[1]) {
    lastEntity.indices[1] = tweet.display_text_range[1]
  }
}

/**
 * Enriches a tweet with additional data used to more easily use the tweet in a UI.
 * @see https://github.com/vercel/react-tweet/blob/react-tweet@3.3.1/packages/react-tweet/src/utils.ts
 */
export function enrichTweet(tweet: Tweet): EnrichedTweet {
  return {
    ...tweet,
    url: getTweetUrl(tweet),
    user: {
      ...tweet.user,
      url: getUserUrl(tweet),
      follow_url: getFollowUrl(tweet),
    },
    like_url: getLikeUrl(tweet),
    reply_url: getReplyUrl(tweet),
    in_reply_to_url: tweet.in_reply_to_screen_name
      ? getInReplyToUrl(tweet)
      : undefined,
    entities: getEntities(tweet),
    quoted_tweet: tweet.quoted_tweet
      ? {
          ...tweet.quoted_tweet,
          url: getTweetUrl(tweet.quoted_tweet),
          entities: getEntities(tweet.quoted_tweet),
        }
      : undefined,
  }
}
