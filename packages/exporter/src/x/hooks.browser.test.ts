import { afterEach, describe, expect, it, vi } from 'vitest'

import { installResponseHooks, type ObservedResponse } from './hooks.ts'

const FIXTURE_URL = '/src/x/testing/fixtures/HomeTimeline.json'
const OTHER_URL = '/src/x/testing/fixtures/TweetDetail.json'

function resolveFixture(url: string): string | undefined {
  return url.endsWith('/HomeTimeline.json') ? 'HomeTimeline' : undefined
}

const originalFetch = globalThis.fetch
// eslint-disable-next-line @typescript-eslint/unbound-method -- identity check only
const originalOpen = XMLHttpRequest.prototype.open
let uninstall: (() => void) | undefined

function install(
  overrides: {
    resolve?: (url: string) => string | undefined
    onResponse?: (response: ObservedResponse) => void
    onError?: (error: unknown) => void
  } = {},
) {
  const responses: ObservedResponse[] = []
  const errors: unknown[] = []
  uninstall = installResponseHooks({
    target: globalThis,
    resolveOperation: overrides.resolve ?? resolveFixture,
    onResponse:
      overrides.onResponse ??
      ((response) => {
        responses.push(response)
      }),
    onError:
      overrides.onError ??
      ((error) => {
        errors.push(error)
      }),
  })
  return { responses, errors }
}

function waitForCount<T>(list: T[], count: number) {
  return vi.waitFor(() => {
    expect(list).toHaveLength(count)
  })
}

function sendXHR(url: string, responseType: XMLHttpRequestResponseType = '') {
  return new Promise<XMLHttpRequest>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.responseType = responseType
    xhr.addEventListener('load', () => resolve(xhr))
    xhr.addEventListener('error', () => reject(new Error('xhr failed')))
    xhr.open('GET', url)
    xhr.send()
  })
}

afterEach(() => {
  uninstall?.()
  uninstall = undefined
  expect(globalThis.fetch).toBe(originalFetch)
  // eslint-disable-next-line @typescript-eslint/unbound-method -- identity check only
  expect(XMLHttpRequest.prototype.open).toBe(originalOpen)
})

describe('installResponseHooks with fetch', () => {
  it('copies a matching response and leaves the page copy readable', async () => {
    const { responses } = install()
    const response = await fetch(FIXTURE_URL)
    const json = (await response.json()) as { data: unknown }
    expect(json.data).toBeDefined()
    await waitForCount(responses, 1)
    expect(responses[0]).toMatchObject({
      operation: 'HomeTimeline',
      transport: 'fetch',
    })
    expect(responses[0].url.endsWith(FIXTURE_URL)).toBe(true)
    expect(JSON.parse(responses[0].body)).toEqual(json)
  })

  it('ignores requests the resolver declines', async () => {
    const { responses } = install()
    await (await fetch(OTHER_URL)).text()
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(responses).toEqual([])
  })

  it('accepts Request and URL inputs', async () => {
    const { responses } = install()
    await fetch(new Request(FIXTURE_URL))
    await fetch(new URL(FIXTURE_URL, location.href))
    await waitForCount(responses, 2)
  })

  it('reports a throwing resolver and still returns the response', async () => {
    const { responses, errors } = install({
      resolve: () => {
        throw new Error('resolver broke')
      },
    })
    const response = await fetch(FIXTURE_URL)
    expect(response.ok).toBe(true)
    expect(errors).toHaveLength(1)
    expect(responses).toEqual([])
  })

  it('reports a throwing onResponse without touching the page', async () => {
    const { errors } = install({
      onResponse: () => {
        throw new Error('consumer broke')
      },
    })
    const response = await fetch(FIXTURE_URL)
    expect((await response.json()) as unknown).toBeDefined()
    await waitForCount(errors, 1)
  })

  it('passes a failed fetch through unchanged', async () => {
    const { responses } = install({ resolve: () => 'Anything' })
    await expect(fetch('http://127.0.0.1:1/unreachable')).rejects.toThrow()
    expect(responses).toEqual([])
  })
})

describe('installResponseHooks with XMLHttpRequest', () => {
  it('copies a text response after load', async () => {
    const { responses } = install()
    const xhr = await sendXHR(FIXTURE_URL)
    expect(xhr.status).toBe(200)
    await waitForCount(responses, 1)
    expect(responses[0]).toMatchObject({
      operation: 'HomeTimeline',
      transport: 'xhr',
    })
    expect(JSON.parse(responses[0].body)).toEqual(JSON.parse(xhr.responseText))
  })

  it('re-serializes a json response', async () => {
    const { responses } = install()
    const xhr = await sendXHR(FIXTURE_URL, 'json')
    await waitForCount(responses, 1)
    expect(JSON.parse(responses[0].body)).toEqual(xhr.response)
  })

  it('skips binary response types and unmatched URLs', async () => {
    const { responses } = install()
    await sendXHR(FIXTURE_URL, 'arraybuffer')
    await sendXHR(OTHER_URL)
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(responses).toEqual([])
  })
})

describe('uninstall', () => {
  it('stops observing and restores the originals', async () => {
    const { responses } = install()
    uninstall?.()
    uninstall = undefined
    await (await fetch(FIXTURE_URL)).text()
    await sendXHR(FIXTURE_URL)
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(responses).toEqual([])
  })

  it('leaves a later replacement of fetch alone', () => {
    install()
    const replacement = (() => {
      return Promise.reject(new Error('replaced'))
    }) as typeof fetch
    globalThis.fetch = replacement
    uninstall?.()
    uninstall = undefined
    expect(globalThis.fetch).toBe(replacement)
    globalThis.fetch = originalFetch
  })
})
