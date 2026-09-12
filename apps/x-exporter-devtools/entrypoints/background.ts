import { browser } from 'wxt/browser'

import { defineBackground } from '#imports'

import {
  ENTRY_LIMIT,
  type ContentMessage,
  type StoredEntries,
} from '../lib/shared'

async function remember(message: ContentMessage): Promise<void> {
  const stored = await browser.storage.session.get('entries')
  const entries = (stored['entries'] ?? {}) as StoredEntries
  entries[message.entry.tweet.id_str] = message.entry
  const ids = Object.keys(entries).sort(
    (left, right) => entries[right].capturedAt - entries[left].capturedAt,
  )
  for (const id of ids.slice(ENTRY_LIMIT)) delete entries[id]
  await browser.storage.session.set({ entries })
}

export default defineBackground(() => {
  browser.runtime.onMessage.addListener(
    (message: ContentMessage, _sender, sendResponse) => {
      if (message?.type !== 'x-exporter:captured') return false
      remember(message).then(
        () => sendResponse({ ok: true }),
        (error: unknown) => {
          console.error('[post-embed exporter devtools] store failed', error)
          sendResponse({ ok: false })
        },
      )
      return true
    },
  )
})
