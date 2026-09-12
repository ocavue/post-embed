import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  exposeXTweets,
  onXTweetBroadcast,
  requestXTweet,
  X_BRIDGE_CHANNEL,
} from './bridge.ts'
import { observeXTweets, type XObserver } from './observer.ts'

const HOME_URL = '/src/x/testing/fixtures/HomeTimeline.json'

function resolveFixture(url: string): string | undefined {
  return url.endsWith('/HomeTimeline.json') ? 'HomeTimeline' : undefined
}

let observer: XObserver | undefined
const cleanups: (() => void)[] = []

function setup(broadcast = false) {
  observer = observeXTweets({ resolveOperation: resolveFixture })
  cleanups.push(exposeXTweets(observer, { broadcast }))
  return observer
}

afterEach(() => {
  for (const cleanup of cleanups.splice(0)) cleanup()
  observer?.dispose()
  observer = undefined
})

describe('bridge', () => {
  it('answers a request from the cache', async () => {
    const observer = setup()
    await (await fetch(HOME_URL)).text()
    await observer.waitFor('1000000000000000001', { timeoutMs: 2000 })
    const entry = await requestXTweet('1000000000000000001')
    expect(entry?.post).toEqual(observer.get('1000000000000000001')!.post)
    expect(entry?.operation).toBe('HomeTimeline')
  })

  it('answers undefined for an unobserved post', async () => {
    setup()
    expect(await requestXTweet('9')).toBeUndefined()
  })

  it('waits for the post when asked to', async () => {
    setup()
    const pending = requestXTweet('1000000000000000002', { waitMs: 2000 })
    await new Promise((resolve) => setTimeout(resolve, 100))
    await (await fetch(HOME_URL)).text()
    const entry = await pending
    expect(entry?.post.id).toBe('1000000000000000002')
  })

  it('gives up when nothing answers', async () => {
    expect(await requestXTweet('1', { timeoutMs: 50 })).toBeUndefined()
  })

  it('broadcasts new entries when enabled', async () => {
    setup(true)
    const seen: string[] = []
    cleanups.push(
      onXTweetBroadcast((entry) => {
        seen.push(entry.post.id)
      }),
    )
    await (await fetch(HOME_URL)).text()
    await vi.waitFor(() => {
      expect(seen).toHaveLength(4)
    })
  })

  it('drops an answer whose post does not match the request', async () => {
    const onMessage = (event: MessageEvent) => {
      const envelope = event.data as {
        channel?: string
        data?: { t?: string; i?: string }
      }
      if (envelope?.channel !== X_BRIDGE_CHANNEL || envelope.data?.t !== 'q')
        return
      window.postMessage(
        {
          channel: X_BRIDGE_CHANNEL,
          from: 'forger',
          data: {
            t: 's',
            i: envelope.data.i,
            r: {
              post: { id: 'someone-else', author: {} },
              protected: false,
              operation: 'TweetDetail',
              capturedAt: 0,
            },
          },
        },
        location.origin,
      )
    }
    window.addEventListener('message', onMessage)
    cleanups.push(() => window.removeEventListener('message', onMessage))
    expect(await requestXTweet('1', { timeoutMs: 200 })).toBeUndefined()
  })
})
