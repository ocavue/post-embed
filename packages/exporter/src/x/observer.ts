import type { XPost } from '@post-embed/types'
import { createLRU } from 'lru.min'

import { extractTweetResults } from './extract.ts'
import { installResponseHooks, type ObservedResponse } from './hooks.ts'
import { toXPost } from './normalize.ts'
import { matchXOperation } from './operations.ts'

export interface XTweetEntry {
  post: XPost
  protected: boolean
  operation: string
  capturedAt: number
  /**
   * The GraphQL result the tweet came from; present only with `keepRaw`.
   */
  raw?: unknown
}

export interface XObserverOptions {
  /**
   * Defaults to `globalThis`; tests pass an iframe's window.
   */
  target?: typeof globalThis
  /**
   * Defaults to `matchXOperation`.
   */
  resolveOperation?: (url: string) => string | undefined
  /**
   * Oldest entries are evicted past this many. Default 200.
   */
  capacity?: number
  /**
   * Keep the GraphQL result on each entry (for fixtures and debugging).
   */
  keepRaw?: boolean
  onError?: (error: unknown) => void
}

export interface XObserver {
  get(postId: string): XTweetEntry | undefined
  /**
   * Every cached post id, most recently used first.
   */
  ids(): string[]
  subscribe(listener: (entry: XTweetEntry) => void): () => void
  /**
   * Resolves with the entry once observed; rejects on timeout or abort.
   */
  waitFor(
    postId: string,
    options?: { timeoutMs?: number; signal?: AbortSignal },
  ): Promise<XTweetEntry>
  dispose(): void
}

/**
 * Install the response hooks and index every tweet the page receives. The
 * page keeps working exactly as before: the observer only reads copies.
 */
export function observeXTweets(options: XObserverOptions = {}): XObserver {
  const target = options.target ?? globalThis
  const capacity = options.capacity ?? 200
  const entries = createLRU<string, XTweetEntry>({ max: capacity })
  const listeners = new Set<(entry: XTweetEntry) => void>()

  const remember = (entry: XTweetEntry) => {
    entries.set(entry.post.id, entry)
    for (const listener of listeners) {
      try {
        listener(entry)
      } catch (error) {
        options.onError?.(error)
      }
    }
  }

  const onResponse = (response: ObservedResponse) => {
    let json: unknown
    try {
      json = JSON.parse(response.body)
    } catch {
      return
    }
    const capturedAt = Date.now()
    for (const result of extractTweetResults(json)) {
      // A retweet wrapper only says "RT @x"; the original is indexed on its own.
      if (result.legacy.retweeted_status_result) continue
      const capture = toXPost(result)
      if (!capture) continue
      remember({
        ...capture,
        operation: response.operation,
        capturedAt,
        raw: options.keepRaw ? result : undefined,
      })
    }
  }

  const uninstall = installResponseHooks({
    target,
    resolveOperation: options.resolveOperation ?? matchXOperation,
    onResponse,
    onError: options.onError,
  })

  const subscribe = (listener: (entry: XTweetEntry) => void) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }

  return {
    get: (postId) => entries.get(postId),
    ids: () => [...entries.keys()],
    subscribe,
    waitFor(postId, waitOptions = {}) {
      const existing = entries.get(postId)
      if (existing) return Promise.resolve(existing)
      const timeoutMs = waitOptions.timeoutMs ?? 10_000
      return new Promise((resolve, reject) => {
        const finish = () => {
          unsubscribe()
          clearTimeout(timer)
          waitOptions.signal?.removeEventListener('abort', onAbort)
        }
        const onAbort = () => {
          finish()
          reject(
            waitOptions.signal?.reason instanceof Error
              ? waitOptions.signal.reason
              : new Error('aborted'),
          )
        }
        const unsubscribe = subscribe((entry) => {
          if (entry.post.id !== postId) return
          finish()
          resolve(entry)
        })
        const timer = setTimeout(() => {
          finish()
          reject(
            new Error(`Post ${postId} was not observed within ${timeoutMs}ms`),
          )
        }, timeoutMs)
        waitOptions.signal?.addEventListener('abort', onAbort, { once: true })
      })
    },
    dispose() {
      uninstall()
      listeners.clear()
      entries.clear()
    },
  }
}
