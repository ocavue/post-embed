export { observeXTweets } from './observer.ts'
export type { XObserver, XObserverOptions, XTweetEntry } from './observer.ts'
export { extractTweetResults } from './extract.ts'
export { toISODate, toXPost, unwrapTweetResult } from './normalize.ts'
export type { XPostCapture } from './normalize.ts'
export { segmentsToText, toSegments } from './segments.ts'
export type { EntityInput } from './segments.ts'
export { matchXOperation, X_TWEET_OPERATIONS } from './operations.ts'
export {
  installFetchHook,
  installResponseHooks,
  installXHRHook,
} from './hooks.ts'
export type { ObservedResponse, ResponseHookOptions } from './hooks.ts'
export type { GraphQLTweet } from './graphql.ts'
