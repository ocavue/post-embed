import {
  defineCustomElement,
  defineProps,
  type HostElement,
  type State,
  useEffect as useHostEffect,
} from '@aria-ui/core'
import { TweetSchema } from '@post-embed/schema'
import type { Tweet } from '@post-embed/types'
import el from 'crelt'

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
    const result =
      data == null
        ? undefined
        : assumeNotPromise(TweetSchema['~standard'].validate(data))

    if (result?.issues) {
      console.error('[post-embed] Invalid X post data:', result.issues)
    }

    container.replaceChildren(
      result && !result.issues
        ? // Upstream enrichment mutates display_text_range on the tweet and quote.
          renderTweet(enrichTweet(structuredClone(result.value)))
        : el(
            'article',
            { 'data-fallback': '' },
            el('header', { 'data-author': '' }, el('bdi', {}, 'X post')),
            el('p', { 'data-body': '' }, 'This post is unavailable.'),
            el(
              'footer',
              { 'data-footer': '' },
              'No saved post could be displayed.',
            ),
          ),
    )
    return () => {
      for (const video of container?.querySelectorAll('video') || [])
        video.pause()
    }
  })
}

export const XPost = defineCustomElement(
  useXPost,
  defineProps<XPostProps>({
    data: { default: null, attribute: false },
  }),
)
