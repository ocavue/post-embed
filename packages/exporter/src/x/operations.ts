/**
 * GraphQL operations whose responses carry full tweet objects.
 * `TweetResultByRestId` is the logged-out permalink path; the rest are the
 * logged-in timelines and the post page.
 */
export const X_TWEET_OPERATIONS: readonly string[] = [
  'TweetDetail',
  'TweetResultByRestId',
  'HomeTimeline',
  'HomeLatestTimeline',
  'Bookmarks',
  'UserTweets',
  'UserTweetsAndReplies',
  'UserMedia',
  'Likes',
  'SearchTimeline',
  'ListLatestTweetsTimeline',
  'CommunityTweetsTimeline',
  'ModeratedTimeline',
]

const GRAPHQL_PATH = /^\/(?:i\/api\/)?graphql\/[^/]+\/(\w+)\/?$/
const X_HOST = /(?:^|\.)(?:x|twitter)\.com$/

/**
 * The operation name of an X GraphQL request URL, or `undefined` when the URL
 * is not one of `operations`. The query id segment is ignored on purpose: X
 * rotates it, the operation name is stable.
 */
export function matchXOperation(
  url: string,
  operations: readonly string[] = X_TWEET_OPERATIONS,
): string | undefined {
  let parsed: URL
  try {
    parsed = new URL(url, 'https://x.com')
  } catch {
    return undefined
  }
  if (!X_HOST.test(parsed.hostname)) return undefined
  const operation = GRAPHQL_PATH.exec(parsed.pathname)?.[1]
  return operation !== undefined && operations.includes(operation)
    ? operation
    : undefined
}
