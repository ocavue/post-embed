import type { GraphQLTweet } from './graphql.ts'
import { unwrapTweetResult } from './normalize.ts'

const MAX_VISITED_NODES = 200_000

/**
 * Every tweet object anywhere in a GraphQL response, deduplicated by
 * `rest_id`. Walks the whole tree instead of the per-operation timeline
 * shapes, so a new operation or a rearranged `instructions` list still works.
 */
export function extractTweetResults(root: unknown): GraphQLTweet[] {
  const found: GraphQLTweet[] = []
  const seen = new Set<string>()
  const stack: unknown[] = [root]
  let visited = 0
  while (stack.length > 0) {
    const node = stack.pop()
    if (typeof node !== 'object' || node === null) continue
    if (++visited > MAX_VISITED_NODES) break
    if (Array.isArray(node)) {
      for (let index = node.length - 1; index >= 0; index--) {
        stack.push(node[index])
      }
      continue
    }
    const tweet = unwrapTweetResult(node)
    if (tweet && !seen.has(tweet.rest_id)) {
      seen.add(tweet.rest_id)
      found.push(tweet)
    }
    const record = node as Record<string, unknown>
    const keys = Object.keys(record)
    for (let index = keys.length - 1; index >= 0; index--) {
      stack.push(record[keys[index]])
    }
  }
  return found
}
