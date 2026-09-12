import {
  installResponseHooks,
  matchXOperation,
  observeXTweets,
} from '@post-embed/exporter/x'
import { exposeXTweets } from '@post-embed/exporter/x/bridge'

import { defineContentScript } from '#imports'

import {
  DEVTOOLS_CHANNEL,
  RESPONSE_LIMIT,
  type RawResponse,
} from '../lib/shared'

export default defineContentScript({
  matches: ['https://x.com/*', 'https://mobile.x.com/*'],
  runAt: 'document_start',
  world: 'MAIN',
  main() {
    const observer = observeXTweets({
      keepRaw: true,
      onError: (error) => console.error('[post-embed exporter]', error),
    })
    exposeXTweets(observer, { broadcast: true })

    // Whole responses for fixtures; the observer only keeps single results.
    const responses: RawResponse[] = []
    installResponseHooks({
      target: globalThis,
      resolveOperation: matchXOperation,
      onResponse: (response) => {
        responses.push(response)
        if (responses.length > RESPONSE_LIMIT) responses.shift()
      },
    })
    window.addEventListener('message', (event) => {
      if (event.source !== window) return
      const data = event.data as {
        channel?: string
        type?: string
        id?: string
      }
      if (data?.channel !== DEVTOOLS_CHANNEL || data.type !== 'responses')
        return
      window.postMessage(
        {
          channel: DEVTOOLS_CHANNEL,
          type: 'responses-result',
          id: data.id,
          responses,
        },
        location.origin,
      )
    })
    console.info('[post-embed exporter] observing x.com responses')
  },
})
