import { isObject } from '@ocavue/utils'

import type { GraphQLTweet } from './graphql.ts'
import { unwrapTweetResult } from './normalize.ts'

const MAX_VISITED_NODES = 500_000

/**
 * Extracts every tweet object anywhere in a GraphQL response.
 */
export function extractTweetResults(root: unknown): GraphQLTweet[] {
  const found: GraphQLTweet[] = []
  const seen = new Set<string>()
  const stack: unknown[] = [root]
  let visited = 0
  while (stack.length > 0) {
    const node = stack.pop()
    if (!node || !isObject(node)) continue

    if (++visited > MAX_VISITED_NODES) break

    if (Array.isArray(node)) {
      const children: unknown[] = Array.from(node)
      stack.push(...children.reverse())
      continue
    }

    const tweet = unwrapTweetResult(node)
    if (tweet && !seen.has(tweet.rest_id)) {
      seen.add(tweet.rest_id)
      found.push(tweet)
    }
    const children: unknown[] = Object.values(node)
    stack.push(...children.reverse())
  }
  return found
}
