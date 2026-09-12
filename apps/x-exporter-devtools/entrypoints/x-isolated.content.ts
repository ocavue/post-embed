import { onXTweetBroadcast, requestXTweet } from '@post-embed/exporter/x/bridge'
import { browser } from 'wxt/browser'

import { defineContentScript } from '#imports'

import {
  DEVTOOLS_CHANNEL,
  type ContentMessage,
  type PopupMessage,
  type RawResponse,
} from '../lib/shared'

function requestResponses(): Promise<RawResponse[]> {
  const id = crypto.randomUUID()
  return new Promise((resolve) => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== window) return
      const data = event.data as {
        channel?: string
        type?: string
        id?: string
        responses?: RawResponse[]
      }
      if (
        data?.channel !== DEVTOOLS_CHANNEL ||
        data.type !== 'responses-result'
      )
        return
      if (data.id !== id) return
      window.removeEventListener('message', onMessage)
      clearTimeout(timer)
      resolve(data.responses ?? [])
    }
    const timer = setTimeout(() => {
      window.removeEventListener('message', onMessage)
      resolve([])
    }, 2000)
    window.addEventListener('message', onMessage)
    window.postMessage(
      { channel: DEVTOOLS_CHANNEL, type: 'responses', id },
      location.origin,
    )
  })
}

export default defineContentScript({
  matches: ['https://x.com/*', 'https://mobile.x.com/*'],
  runAt: 'document_start',
  main() {
    onXTweetBroadcast((entry) => {
      const message: ContentMessage = { type: 'x-exporter:captured', entry }
      void browser.runtime.sendMessage(message)
    })
    browser.runtime.onMessage.addListener(
      (message: PopupMessage, _sender, sendResponse) => {
        if (message?.type === 'x-exporter:lookup') {
          void requestXTweet(message.postId, { waitMs: 0 }).then((entry) => {
            sendResponse(entry ?? null)
          })
          return true
        }
        if (message?.type === 'x-exporter:responses') {
          void requestResponses().then(sendResponse)
          return true
        }
        return false
      },
    )
  },
})
