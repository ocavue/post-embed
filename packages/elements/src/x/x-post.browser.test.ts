import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { page, server, userEvent } from 'vitest/browser'

import { createMediaTweet, createTweet } from './testing/fixtures.ts'

import { registerXPost, type XPostElement } from './index.ts'

beforeAll(() => {
  registerXPost()
})

function mount(text = 'Hello 😀\nA saved post.') {
  const element = document.createElement('post-embed-x-post')
  element.dataset.testid = 'post'
  element.data = createTweet(text)
  document.body.append(element)
  return element
}

const post = page.getByTestId('post')

afterEach(() => {
  document.body.replaceChildren()
  vi.restoreAllMocks()
})

describe('X post', () => {
  it('renders selectable light DOM text and native attribution links', async () => {
    const element = mount()
    await expect.element(post.getByText(/Hello 😀/)).toBeVisible()
    await expect
      .element(post.getByRole('link', { name: 'View on X' }))
      .toHaveAttribute(
        'href',
        'https://x.com/example/status/1234567890123456789',
      )
    expect(element.shadowRoot).toBeNull()
    expect(element.hasAttribute('data')).toBe(false)
    if (server.browser === 'webkit' && navigator.platform.includes('Mac')) {
      await userEvent.keyboard('{Alt>}{Tab}{/Alt}')
    } else {
      await userEvent.tab()
    }
    await expect
      .element(post.getByRole('link', { name: '@example' }))
      .toHaveFocus()
  })

  it('decodes HTML character references once', async () => {
    mount('A &amp; B &amp;lt; C')
    await expect.element(post.getByText('A & B &lt; C')).toBeVisible()
  })

  it('renders markup as literal text', async () => {
    mount('&lt;img src=x onerror=alert(1)&gt;')
    await expect
      .element(post.getByText('<img src=x onerror=alert(1)>'))
      .toBeVisible()
    await expect.element(post.getByRole('img')).not.toBeInTheDocument()
  })

  it('updates the same ID and clears the current view immediately', async () => {
    const element = mount('First')
    await expect.element(post.getByText('First')).toBeVisible()
    element.data = createTweet('Second')
    expect(element.textContent).not.toContain('First')
    await expect.element(post.getByText('Second')).toBeVisible()
    element.data = createTweet('Late')
    element.data = null
    await expect.element(post).toHaveTextContent('')
    await Promise.resolve()
    expect(element.textContent).toBe('')
  })

  it('shows invalid input and recovers with a valid snapshot', async () => {
    const element = mount('Before')
    await expect.element(post.getByText('Before')).toBeVisible()
    Reflect.set(element, 'data', {})
    await expect.element(post.getByText('Post data unavailable')).toBeVisible()
    element.data = createTweet('Recovered')
    await expect.element(post.getByText('Recovered')).toBeVisible()
  })

  it('handles schema defaults without inventing attribution', async () => {
    const element = mount()
    Reflect.set(element, 'data', { user: {}, edit_control: {} })
    await expect.element(post).toHaveTextContent('')
    await expect.element(post.getByRole('link')).not.toBeInTheDocument()
  })

  it('reconnects with the latest data and preserves host children', async () => {
    const element = mount('First')
    const annotation = document.createElement('span')
    annotation.textContent = 'Host annotation'
    element.append(annotation)
    await expect.element(post.getByText('First')).toBeVisible()
    element.data = createTweet('Stale')
    element.remove()
    element.data = createTweet('Reconnected')
    document.body.append(element)
    await expect.element(post.getByText('Reconnected')).toBeVisible()
    await expect.element(post.getByText('Host annotation')).toBeVisible()
    element.data = null
    await expect.element(post).toHaveTextContent('Host annotation')
    expect(element.children.length).toBe(2)
  })

  it('keeps instances independent and registration idempotent', async () => {
    const constructor = customElements.get('post-embed-x-post')
    registerXPost()
    expect(customElements.get('post-embed-x-post')).toBe(constructor)
    const first = mount('First')
    const second = mount('Second')
    second.dataset.testid = 'second'
    await expect
      .element(page.getByTestId('second').getByText('Second'))
      .toBeVisible()
    first.data = null
    await expect
      .element(page.getByTestId('second').getByText('Second'))
      .toBeVisible()
  })

  it('registers independent custom names alongside the default element', async () => {
    registerXPost('custom-x-post')
    registerXPost('another-x-post')
    registerXPost('custom-x-post')
    const element = document.createElement('custom-x-post') as XPostElement
    element.dataset.testid = 'custom-post'
    element.data = createTweet('Custom name')
    document.body.append(element)
    await expect
      .element(page.getByTestId('custom-post').getByText('Custom name'))
      .toBeVisible()
    await expect
      .element(page.getByTestId('custom-post'))
      .toHaveAttribute('data-post-embed', 'x-post')
    const another = document.createElement('another-x-post') as XPostElement
    another.dataset.testid = 'another-post'
    another.data = createTweet('Another name')
    document.body.append(another)
    await expect
      .element(page.getByTestId('another-post').getByText('Another name'))
      .toBeVisible()
  })

  it('keeps attribution when the body is empty', async () => {
    mount('')
    await expect
      .element(post.getByRole('link', { name: 'View on X' }))
      .toBeVisible()
    await expect.element(post.getByRole('paragraph')).toHaveTextContent('')
  })

  it('does not mutate frozen host ranges, including quotes', async () => {
    const element = mount()
    const tweet = createMediaTweet()
    const original = structuredClone(tweet)
    Object.freeze(tweet.display_text_range)
    Object.freeze(tweet.quoted_tweet?.display_text_range)
    Object.freeze(tweet)
    element.data = tweet
    await expect
      .element(post.getByText('Saved text', { exact: true }))
      .toBeVisible()
    expect(tweet).toEqual(original)
  })

  it('renders unsafe destinations as text', async () => {
    const element = mount()
    const tweet = createTweet('https://t.co/a')
    tweet.entities = {
      hashtags: [],
      user_mentions: [],
      symbols: [],
      urls: [
        {
          indices: [0, 14],
          url: tweet.text,
          expanded_url: 'javascript:alert(1)',
          display_url: 'A link',
        },
      ],
    }
    element.data = tweet
    await expect.element(post.getByText('A link')).toBeVisible()
    await expect
      .element(post.getByRole('link', { name: 'A link' }))
      .not.toBeInTheDocument()
  })
})
