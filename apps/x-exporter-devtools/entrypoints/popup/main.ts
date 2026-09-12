import { registerXPost } from '@post-embed/elements/x'
import type { XTweetEntry } from '@post-embed/exporter/x'
import { scrubFixture } from '@post-embed/exporter/x/testing'
import el from 'crelt'
import { browser } from 'wxt/browser'

import type { PopupMessage, RawResponse, StoredEntries } from '../../lib/shared'

registerXPost()

const app = document.querySelector('#app')
if (!app) throw new Error('missing #app')

const status = el('div', { 'data-status': '' })
const list = el('ul')
const detail = el('div', { 'data-detail': '' })
const lookupInput = el('input', { placeholder: 'Post id', required: true })
const lookupForm = el(
  'form',
  {},
  lookupInput,
  el('button', { type: 'submit' }, 'Lookup in active tab'),
  el(
    'button',
    { type: 'button', 'data-responses': '' },
    'Copy response fixtures',
  ),
)

app.append(
  el('h1', {}, 'post-embed X exporter devtools'),
  lookupForm,
  list,
  detail,
  status,
)

let entries: StoredEntries = {}
let selectedId: string | undefined

function say(message: string) {
  status.textContent = message
}

async function copy(label: string, value: unknown) {
  try {
    await navigator.clipboard.writeText(JSON.stringify(value, null, 2))
    say(`${label} copied.`)
  } catch (error) {
    say(
      `Copy failed: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

async function activeXTab() {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
  if (
    !tab?.id ||
    !tab.url ||
    !/^https:\/\/(?:mobile\.)?x\.com\//.test(tab.url)
  ) {
    say('The active tab is not x.com.')
    return
  }
  return tab.id
}

async function sendToActiveTab<T>(
  message: PopupMessage,
): Promise<T | undefined> {
  const tabId = await activeXTab()
  if (tabId === undefined) return undefined
  try {
    return await browser.tabs.sendMessage(tabId, message)
  } catch (error) {
    say(
      `No content script answered: ${error instanceof Error ? error.message : String(error)}`,
    )
    return undefined
  }
}

function renderDetail(entry: XTweetEntry | undefined) {
  detail.replaceChildren()
  if (!entry) return
  const post = document.createElement('post-embed-x-post')
  post.data = entry.tweet
  detail.append(
    el(
      'div',
      { 'data-actions': '' },
      el(
        'button',
        {
          type: 'button',
          onclick: () => void copy('Tweet JSON', entry.tweet),
        },
        'Copy tweet JSON',
      ),
      el(
        'button',
        {
          type: 'button',
          onclick: () => {
            return void copy('Result fixture', {
              operation: entry.operation,
              postId: entry.tweet.id_str,
              protected: entry.protected,
              raw: scrubFixture(entry.raw),
            })
          },
        },
        'Copy result fixture',
      ),
    ),
    el(
      'div',
      {},
      `${entry.operation} at ${new Date(entry.capturedAt).toLocaleTimeString()}`,
      entry.protected ? ' (protected author)' : '',
    ),
    post,
  )
}

function renderList() {
  const sorted = Object.values(entries).sort(
    (left, right) => right.capturedAt - left.capturedAt,
  )
  list.replaceChildren(
    ...sorted.map((entry) => {
      return el(
        'li',
        {
          'data-selected': entry.tweet.id_str === selectedId ? '' : undefined,
          onclick: () => {
            selectedId = entry.tweet.id_str
            renderList()
            renderDetail(entry)
          },
        },
        `${entry.tweet.id_str} @${entry.tweet.user.screen_name}`,
        entry.protected
          ? el('span', { 'data-protected': '' }, ' protected')
          : undefined,
        el('small', {}, `${entry.operation}: ${entry.tweet.text.slice(0, 60)}`),
      )
    }),
  )
  if (sorted.length === 0) {
    list.append(el('li', {}, 'Nothing captured yet. Browse x.com in a tab.'))
  }
}

async function load() {
  const stored = await browser.storage.session.get('entries')
  entries = (stored['entries'] ?? {}) as StoredEntries
  renderList()
}

browser.storage.onChanged.addListener((_changes, area) => {
  if (area === 'session') void load()
})

lookupForm.addEventListener('submit', (event) => {
  event.preventDefault()
  const postId = lookupInput.value.trim()
  if (!postId) return
  void sendToActiveTab<XTweetEntry | null>({
    type: 'x-exporter:lookup',
    postId,
  }).then((entry) => {
    if (entry === undefined) return
    if (!entry) {
      say(`Post ${postId} was not observed in the active tab.`)
      renderDetail(undefined)
      return
    }
    say(`Post ${postId} answered by the MAIN world.`)
    selectedId = postId
    renderDetail(entry)
  })
})

lookupForm.querySelector('[data-responses]')?.addEventListener('click', () => {
  void sendToActiveTab<RawResponse[]>({ type: 'x-exporter:responses' }).then(
    (responses) => {
      if (!responses) return
      if (responses.length === 0) {
        say('The active tab has no buffered responses.')
        return
      }
      const fixtures = responses.map((response) => {
        let body: unknown
        try {
          body = JSON.parse(response.body)
        } catch {
          body = response.body
        }
        return {
          url: response.url,
          operation: response.operation,
          transport: response.transport,
          response: scrubFixture(body),
        }
      })
      void copy(`${fixtures.length} response fixtures`, fixtures)
    },
  )
})

void load()
