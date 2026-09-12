import { XPostSchema } from '@post-embed/schema'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { observeXTweets, type XObserver } from './observer.ts'

const HOME_URL = '/src/x/testing/fixtures/HomeTimeline.json'
const DETAIL_URL = '/src/x/testing/fixtures/TweetDetail.json'

function resolveFixture(url: string): string | undefined {
  if (url.endsWith('/HomeTimeline.json')) return 'HomeTimeline'
  if (url.endsWith('/TweetDetail.json')) return 'TweetDetail'
  return undefined
}

let observer: XObserver | undefined

function observe(options: { capacity?: number; keepRaw?: boolean } = {}) {
  observer = observeXTweets({ ...options, resolveOperation: resolveFixture })
  return observer
}

afterEach(() => {
  observer?.dispose()
  observer = undefined
})

describe('observeXTweets', () => {
  it('indexes every tweet in a fetched response except retweet wrappers', async () => {
    const observer = observe({ keepRaw: true })
    await (await fetch(HOME_URL)).text()
    await vi.waitFor(() => {
      expect(observer.ids()).toHaveLength(4)
    })
    expect(observer.ids()).toEqual([
      '1000000000000000005',
      '1000000000000000003',
      '1000000000000000002',
      '1000000000000000001',
    ])
    const entry = observer.get('1000000000000000002')!
    expect(entry.operation).toBe('HomeTimeline')
    expect(entry.protected).toBe(false)
    expect(typeof entry.capturedAt).toBe('number')
    expect(entry.raw).toMatchObject({ rest_id: '1000000000000000002' })
    expect(observer.get('1000000000000000005')!.protected).toBe(true)
    const validated = XPostSchema['~standard'].validate(entry.post)
    if (validated instanceof Promise) throw new Error('sync schema expected')
    expect(validated.issues).toBeUndefined()
  })

  it('omits raw results by default', async () => {
    const observer = observe()
    await (await fetch(HOME_URL)).text()
    const entry = await observer.waitFor('1000000000000000001', {
      timeoutMs: 2000,
    })
    expect(entry.raw).toBeUndefined()
  })

  it('resolves waitFor once the post arrives', async () => {
    const observer = observe()
    const pending = observer.waitFor('2000000000000000001', { timeoutMs: 2000 })
    await (await fetch(DETAIL_URL)).text()
    const entry = await pending
    expect(entry.post.body[0]).toMatchObject({ type: 'text' })
    expect(entry.post.body[0].text.startsWith('A long post')).toBe(true)
  })

  it('rejects waitFor on timeout and on abort', async () => {
    const observer = observe()
    await expect(observer.waitFor('9', { timeoutMs: 20 })).rejects.toThrow(
      'was not observed',
    )
    const controller = new AbortController()
    const pending = observer.waitFor('9', {
      timeoutMs: 2000,
      signal: controller.signal,
    })
    controller.abort(new Error('stop'))
    await expect(pending).rejects.toThrow('stop')
  })

  it('notifies subscribers and evicts the oldest entries past capacity', async () => {
    const observer = observe({ capacity: 2 })
    const seen: string[] = []
    const unsubscribe = observer.subscribe((entry) => {
      seen.push(entry.post.id)
    })
    await (await fetch(HOME_URL)).text()
    await vi.waitFor(() => {
      expect(seen).toHaveLength(4)
    })
    expect(observer.ids()).toEqual([
      '1000000000000000005',
      '1000000000000000003',
    ])
    unsubscribe()
    await (await fetch(DETAIL_URL)).text()
    await vi.waitFor(() => {
      expect(observer.get('2000000000000000001')).toBeDefined()
    })
    expect(seen).toHaveLength(4)
  })

  it('stops after dispose', async () => {
    const observer = observe()
    observer.dispose()
    await (await fetch(HOME_URL)).text()
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(observer.ids()).toEqual([])
  })
})
