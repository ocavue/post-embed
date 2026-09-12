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

import { type FetchProps, useFetch } from '../fetch.ts'
import { getRootContainer } from '../root.ts'
import { assumeNotPromise } from '../utils.ts'

import { renderTweet } from './render-tweet.ts'
import { enrichTweet } from './utils.ts'

export interface XPostProps extends FetchProps<Tweet> {}

export interface XPostElement extends HTMLElement, XPostProps {}

/** @internal */
export function useXPost(host: HostElement, props: State<XPostProps>): void {
  const { fetched, pending } = useFetch(host, props, 'X post')

  useHostEffect(host, () => {
    host.dataset.postEmbed = 'x-post'
    const container = getRootContainer(host)
    const data = props.data.get() ?? fetched.get()
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
        : renderFallback(pending.get()),
    )
    return () => {
      for (const video of container.querySelectorAll('video')) video.pause()
    }
  })
}

function renderFallback(pending: boolean): HTMLElement {
  return el(
    'article',
    pending
      ? { 'data-fallback': '', 'data-pending': '' }
      : { 'data-fallback': '' },
    el('header', { 'data-author': '' }, el('bdi', {}, 'X post')),
    el(
      'p',
      { 'data-body': '' },
      pending ? 'Loading this post…' : 'This post is unavailable.',
    ),
    pending
      ? null
      : el(
          'footer',
          { 'data-footer': '' },
          'No saved post could be displayed.',
        ),
  )
}

export const XPost = defineCustomElement(
  useXPost,
  defineProps<XPostProps>({
    data: { default: null, attribute: false },
    url: { default: null, attribute: false },
    onFetch: { default: null, attribute: false },
  }),
)
