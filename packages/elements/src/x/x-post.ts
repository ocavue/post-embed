import {
  defineCustomElement,
  defineProps,
  type HostElement,
  type State,
  useEffect as useHostEffect,
} from '@aria-ui/core'
import { XPostSchema, parseXPostId } from '@post-embed/schema'
import type { XPost as XPostSnapshot } from '@post-embed/types'
import el from 'crelt'

import { type FetchProps, useFetch } from '../fetch.ts'
import { getRootContainer } from '../root.ts'
import { assumeNotPromise } from '../utils.ts'

import { renderPost } from './render-post.ts'

export interface XPostProps extends FetchProps<XPostSnapshot> {
  mediaUrlProtocols: readonly string[] | null
  // FIXME: goes away with `FetchProps.revision`, see fetch.ts.
  revision: string | number | null
}

export interface XPostElement extends HTMLElement, XPostProps {}

/** @internal */
export function useXPost(host: HostElement, props: State<XPostProps>): void {
  const { fetched, pending } = useFetch(host, props, 'X post')

  // FIXME: this unmount-only effect plus the `video.pause()` loop inside the render effect below
  // re-implement what the original `return () => { pause all videos }` cleanup of the render effect
  // did in one place (a cleanup runs before every re-run and on unmount). Restore the cleanup
  // return and delete both.
  useHostEffect(host, () => () => {
    for (const video of getRootContainer(host).querySelectorAll('video'))
      video.pause()
  })

  useHostEffect(host, () => {
    host.dataset.postEmbed = 'x-post'
    const container = getRootContainer(host)
    const data = props.data.get() ?? fetched.get()
    const result =
      data == null
        ? undefined
        : assumeNotPromise(XPostSchema['~standard'].validate(data))

    if (result?.issues) {
      console.error('[post-embed] Invalid X post data:', result.issues)
    }

    const protocols = props.mediaUrlProtocols.get()
    const url = props.url.get()
    const value = result && !result.issues ? result.value : undefined
    // Validate that resolver output belongs to the requested permalink.
    const valid = value && (!url || parseXPostId(url) === value.id)
    for (const video of container.querySelectorAll('video')) video.pause()
    container.replaceChildren(
      valid ? renderPost(value, protocols) : renderFallback(pending.get()),
    )
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
    resolver: { default: null, attribute: false },
    mediaUrlProtocols: { default: null, attribute: false },
    revision: { default: null, attribute: false },
  }),
)
