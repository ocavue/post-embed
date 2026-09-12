import { TweetSchema } from '@post-embed/schema'

import type { XObserver, XTweetEntry } from './observer.ts'

export const X_BRIDGE_CHANNEL = 'post-embed-x-exporter'

interface BridgeRequest {
  channel: string
  type: 'request'
  id: string
  postId: string
  /**
   * Wait up to this long for the post to be observed instead of answering `null` right away.
   */
  waitMs?: number
}

interface BridgeResponse {
  channel: string
  type: 'response'
  id: string
  entry: XTweetEntry | null
}

interface BridgeBroadcast {
  channel: string
  type: 'entry'
  entry: XTweetEntry
}

type BridgeMessage = BridgeRequest | BridgeResponse | BridgeBroadcast

function isBridgeMessage(
  data: unknown,
  channel: string,
): data is BridgeMessage {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as { channel?: unknown }).channel === channel &&
    typeof (data as { type?: unknown }).type === 'string'
  )
}

export interface ExposeOptions {
  channel?: string
  target?: Window
  /**
   * Also post every new entry as it is observed.
   */
  broadcast?: boolean
}

/**
 * MAIN world: answer `requestXTweet` calls from the isolated world. Only
 * messages from this same window are accepted, so another frame cannot ask.
 */
export function exposeXTweets(
  observer: XObserver,
  options: ExposeOptions = {},
): () => void {
  const channel = options.channel ?? X_BRIDGE_CHANNEL
  const target = options.target ?? window
  const post = (message: BridgeMessage) => {
    target.postMessage(message, target.location.origin)
  }

  const onMessage = (event: MessageEvent) => {
    if (event.source !== target || !isBridgeMessage(event.data, channel)) return
    if (event.data.type !== 'request') return
    const { id, postId, waitMs } = event.data
    const answer = (entry: XTweetEntry | null) => {
      post({ channel, type: 'response', id, entry })
    }
    const existing = observer.get(postId)
    if (existing || !waitMs) {
      answer(existing ?? null)
      return
    }
    observer.waitFor(postId, { timeoutMs: waitMs }).then(answer, () => {
      answer(null)
    })
  }
  target.addEventListener('message', onMessage)

  const unsubscribe = options.broadcast
    ? observer.subscribe((entry) => post({ channel, type: 'entry', entry }))
    : undefined

  return () => {
    target.removeEventListener('message', onMessage)
    unsubscribe?.()
  }
}

export interface RequestOptions {
  channel?: string
  target?: Window
  /**
   * Passed to the MAIN side as `waitMs`. Default 0: answer from the cache only.
   */
  waitMs?: number
  /**
   * Give up after this long with no answer at all (the MAIN script may not be installed). Default 2000.
   */
  timeoutMs?: number
}

/**
 * ISOLATED world: ask the MAIN world for one observed post. The answer is
 * re-validated with `TweetSchema` because it crossed a boundary the page
 * itself can write to.
 */
export function requestXTweet(
  postId: string,
  options: RequestOptions = {},
): Promise<XTweetEntry | undefined> {
  const channel = options.channel ?? X_BRIDGE_CHANNEL
  const target = options.target ?? window
  const id = crypto.randomUUID()
  return new Promise((resolve) => {
    const finish = (entry: XTweetEntry | undefined) => {
      target.removeEventListener('message', onMessage)
      clearTimeout(timer)
      resolve(entry)
    }
    const onMessage = (event: MessageEvent) => {
      if (event.source !== target || !isBridgeMessage(event.data, channel)) {
        return
      }
      if (event.data.type !== 'response' || event.data.id !== id) return
      const entry = event.data.entry
      if (!entry) {
        finish(undefined)
        return
      }
      const validated = TweetSchema['~standard'].validate(entry.tweet)
      if (
        validated instanceof Promise ||
        validated.issues ||
        validated.value.id_str !== postId
      ) {
        finish(undefined)
        return
      }
      finish({ ...entry, tweet: validated.value })
    }
    target.addEventListener('message', onMessage)
    const timer = setTimeout(
      () => finish(undefined),
      (options.timeoutMs ?? 2000) + (options.waitMs ?? 0),
    )
    const request: BridgeRequest = {
      channel,
      type: 'request',
      id,
      postId,
      waitMs: options.waitMs,
    }
    target.postMessage(request, target.location.origin)
  })
}

/**
 * ISOLATED world: receive every entry the MAIN side broadcasts.
 */
export function onXTweetBroadcast(
  listener: (entry: XTweetEntry) => void,
  options: Pick<RequestOptions, 'channel' | 'target'> = {},
): () => void {
  const channel = options.channel ?? X_BRIDGE_CHANNEL
  const target = options.target ?? window
  const onMessage = (event: MessageEvent) => {
    if (event.source !== target || !isBridgeMessage(event.data, channel)) return
    if (event.data.type === 'entry') listener(event.data.entry)
  }
  target.addEventListener('message', onMessage)
  return () => target.removeEventListener('message', onMessage)
}
