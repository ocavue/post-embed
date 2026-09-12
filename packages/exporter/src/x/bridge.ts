import { TweetSchema } from '@post-embed/schema'
import { createBirpc, type ChannelOptions } from 'birpc'

import type { XObserver, XTweetEntry } from './observer.ts'

export const X_BRIDGE_CHANNEL = 'post-embed-x-exporter'

interface Envelope {
  channel: string
  from: string
  data: unknown
}

function isEnvelope(value: unknown, channel: string): value is Envelope {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as Envelope).channel === channel &&
    typeof (value as Envelope).from === 'string'
  )
}

/**
 * A birpc channel over `window.postMessage` between two scripts sharing one
 * window. Only same-window, same-origin messages carrying `channel` are
 * delivered, and a side never receives its own posts.
 */
export function windowChannel(target: Window, channel: string): ChannelOptions {
  const from = crypto.randomUUID()
  const listeners = new Map<
    (data: unknown) => void,
    (event: MessageEvent) => void
  >()
  return {
    post: (data: unknown) => {
      const envelope: Envelope = { channel, from, data }
      target.postMessage(envelope, target.location.origin)
    },
    on: (fn) => {
      const listener = (event: MessageEvent) => {
        if (event.source !== target || event.origin !== target.location.origin)
          return
        if (!isEnvelope(event.data, channel) || event.data.from === from) return
        fn(event.data.data)
      }
      listeners.set(fn, listener)
      target.addEventListener('message', listener)
    },
    off: (fn) => {
      const listener = listeners.get(fn)
      if (!listener) return
      listeners.delete(fn)
      target.removeEventListener('message', listener)
    },
  }
}

/**
 * Functions the MAIN world serves.
 */
export interface XTweetMainFunctions {
  getTweet(postId: string, waitMs?: number): Promise<XTweetEntry | undefined>
}

/**
 * Functions the ISOLATED world serves; `onEntry` is a one-way event.
 */
export interface XTweetIsolatedFunctions {
  onEntry(entry: XTweetEntry): void
}

export interface ExposeOptions {
  channel?: string
  target?: Window
  /**
   * Also send every new entry as it is observed.
   */
  broadcast?: boolean
}

/**
 * MAIN world: serve `getTweet` to the isolated world and optionally push
 * every observed entry. Returns a function that closes the connection.
 */
export function exposeXTweets(
  observer: XObserver,
  options: ExposeOptions = {},
): () => void {
  const functions: XTweetMainFunctions = {
    async getTweet(postId, waitMs = 0) {
      const existing = observer.get(postId)
      if (existing || waitMs <= 0) return existing
      try {
        return await observer.waitFor(postId, { timeoutMs: waitMs })
      } catch {
        return
      }
    },
  }
  const rpc = createBirpc<XTweetIsolatedFunctions, XTweetMainFunctions>(
    functions,
    {
      ...windowChannel(
        options.target ?? window,
        options.channel ?? X_BRIDGE_CHANNEL,
      ),
      eventNames: ['onEntry'],
    },
  )
  const unsubscribe = options.broadcast
    ? observer.subscribe((entry) => {
        void rpc.onEntry.asEvent(entry)
      })
    : undefined
  return () => {
    unsubscribe?.()
    rpc.$close()
  }
}

export interface ClientOptions {
  channel?: string
  target?: Window
  /**
   * Give up on a call after this long, MAIN-side waiting included. Default 2000.
   */
  timeoutMs?: number
  /**
   * Receives entries the MAIN side broadcasts.
   */
  onEntry?: (entry: XTweetEntry) => void
}

export interface XTweetClient {
  /**
   * One observed post, re-validated with `TweetSchema` because it crossed a
   * boundary the page itself can write to. `waitMs` asks the MAIN side to
   * wait for the post; keep it below the client's `timeoutMs`.
   */
  get(
    postId: string,
    options?: { waitMs?: number },
  ): Promise<XTweetEntry | undefined>
  close(): void
}

/**
 * ISOLATED world: connect to the MAIN world's exporter.
 */
export function createXTweetClient(options: ClientOptions = {}): XTweetClient {
  const functions: XTweetIsolatedFunctions = {
    onEntry(entry) {
      options.onEntry?.(entry)
    },
  }
  const rpc = createBirpc<XTweetMainFunctions, XTweetIsolatedFunctions>(
    functions,
    {
      ...windowChannel(
        options.target ?? window,
        options.channel ?? X_BRIDGE_CHANNEL,
      ),
      timeout: options.timeoutMs ?? 2000,
    },
  )
  return {
    async get(postId, getOptions = {}) {
      let entry: XTweetEntry | undefined
      try {
        entry = await rpc.getTweet(postId, getOptions.waitMs ?? 0)
      } catch {
        // No MAIN side, a timeout, or a closed client: all mean "no answer".
        return
      }
      if (!entry) return
      const validated = TweetSchema['~standard'].validate(entry.tweet)
      if (validated instanceof Promise || validated.issues) return
      if (validated.value.id_str !== postId) return
      return { ...entry, tweet: validated.value }
    },
    close: () => rpc.$close(),
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
   * Extra time to wait for any answer at all (the MAIN script may not be installed). Default 2000.
   */
  timeoutMs?: number
}

/**
 * ISOLATED world: ask for one post over a short-lived client.
 */
export async function requestXTweet(
  postId: string,
  options: RequestOptions = {},
): Promise<XTweetEntry | undefined> {
  const waitMs = options.waitMs ?? 0
  const client = createXTweetClient({
    channel: options.channel,
    target: options.target,
    timeoutMs: (options.timeoutMs ?? 2000) + waitMs,
  })
  try {
    return await client.get(postId, { waitMs })
  } finally {
    client.close()
  }
}

/**
 * ISOLATED world: receive every entry the MAIN side broadcasts.
 */
export function onXTweetBroadcast(
  listener: (entry: XTweetEntry) => void,
  options: Pick<RequestOptions, 'channel' | 'target'> = {},
): () => void {
  const client = createXTweetClient({ ...options, onEntry: listener })
  return () => client.close()
}
