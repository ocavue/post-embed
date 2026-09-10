import {
  defineCustomElement,
  defineProps,
  type HostElement,
  type State,
  useEffect as useHostEffect,
} from '@aria-ui/core'
import { TweetSchema } from '@post-embed/schema'
import type { Tweet } from '@post-embed/types'
import { html, render, type RootPart } from 'lit-html'

import { assumeNotPromise } from '../utils.ts'

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
      container =
        host.querySelector<HTMLDivElement>(':scope > div[data-root]') ??
        host.ownerDocument.createElement('div')
      container.dataset.root = ''
      container.replaceChildren()
      if (!container.parentNode) host.append(container)
    }
    root?.setConnected(true)
    const result =
      data == null
        ? undefined
        : assumeNotPromise(TweetSchema['~standard'].validate(data))

    if (result?.issues) {
      console.error('[post-embed] Invalid X post data:', result.issues)
    }

    root = render(
      result && !result.issues
        ? // Upstream enrichment mutates display_text_range on the tweet and quote.
          renderTweet(enrichTweet(structuredClone(result.value)))
        : html`<article data-fallback>
            <header data-author><bdi>X post</bdi></header>
            <p data-body>This post is unavailable.</p>
            <footer data-footer>No saved post could be displayed.</footer>
          </article>`,
      container,
    )
    return () => {
      for (const video of container?.querySelectorAll('video') || [])
        video.pause()
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
