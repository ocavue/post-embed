import {
  defineCustomElement,
  defineProps,
  type HostElement,
  type State,
  useEffect as useHostEffect,
} from '@aria-ui/core'
import { tweetSchema } from '@post-embed/schema'
import type { Tweet } from '@post-embed/types'
import { html, nothing, render, type RootPart } from 'lit-html'

import { renderTweet } from './render-tweet.ts'
import { enrichTweet } from './utils.ts'

export interface XPostProps {
  data: Tweet | null
}

export interface XPostElement extends HTMLElement, XPostProps {}

/** @internal */
export function useXPost(host: HostElement, props: State<XPostProps>): void {
  let container: HTMLDivElement | undefined
  let root: RootPart | undefined

  useHostEffect(host, () => {
    host.dataset.postEmbed = 'x-post'
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
}

export const XPost = defineCustomElement(
  useXPost,
  defineProps<XPostProps>({
    data: { default: null, attribute: false },
  }),
)
