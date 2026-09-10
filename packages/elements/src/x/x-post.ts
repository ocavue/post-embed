import {
  defineCustomElement,
  defineProps,
  useEffect as useHostEffect,
} from '@aria-ui/core'
import { tweetSchema } from '@post-embed/schema'
import type { Tweet } from '@post-embed/types'
import { html, nothing, render, type RootPart } from 'lit-html'

import { enrichTweet } from './enrich-tweet.ts'
import { renderTweet } from './render-tweet.ts'

export interface XPostElement extends HTMLElement {
  data: Tweet | null
}

export const XPost = defineCustomElement(
  (host, props) => {
    let container: HTMLDivElement | undefined
    let root: RootPart | undefined

    useHostEffect(host, () => {
      const data = props.data.get()
      if (!container) {
        container = host.ownerDocument.createElement('div')
        container.dataset.postPart = 'root'
        host.append(container)
      }
      const target = container
      root?.setConnected(true)
      root = render(nothing, target)
      let active = true

      async function update() {
        if (data == null) return
        const result = await tweetSchema['~standard'].validate(data)
        if (!active) return
        root = render(
          result.issues
            ? html`<p>Post data unavailable</p>`
            : renderTweet(enrichTweet(structuredClone(result.value))),
          target,
        )
      }

      void update()
      return () => {
        active = false
        root?.setConnected(false)
      }
    })
  },
  defineProps<{ data: Tweet | null }>({
    data: { default: null, attribute: false },
  }),
)
