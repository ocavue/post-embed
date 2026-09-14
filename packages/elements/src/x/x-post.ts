import {
  defineCustomElement,
  defineProps,
  type HostElement,
  type State,
  useEffect as useHostEffect,
} from '@aria-ui/core'
import { XPostSchema } from '@post-embed/schema'
import {
  parseXPostId,
  type MediaUrlResolver,
  type XPost as XPostSnapshot,
} from '@post-embed/types'
import el from 'crelt'

import { type FetchProps, useFetch } from '../fetch.ts'
import { getRootContainer } from '../root.ts'
import { assumeNotPromise } from '../utils.ts'

import { renderPost } from './render-post.ts'

export interface XPostProps extends FetchProps<XPostSnapshot> {
  resolveMediaUrl: MediaUrlResolver | null
  revision: string | number | null
}

export interface XPostElement extends HTMLElement, XPostProps {}

/** @internal */
export function useXPost(host: HostElement, props: State<XPostProps>): void {
  const { fetched, pending } = useFetch(host, props, 'X post')

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

    const mediaResolver = props.resolveMediaUrl.get()
    const url = props.url.get()
    const value = result && !result.issues ? result.value : undefined
    // FIXME: this is the one id check worth keeping (the element is the trust boundary). The same
    // check is repeated in meowdown `checkedXPostResolver`, in meowdown `defaultResolveXPost`
    // (`post?.id === id`), in reflect `XPostHost`, `lookupCapturedPost`, `saveXPost`,
    // `parseArchivedPost`, and Rust `read_post`/`put_capture`. Delete the duplicates.
    const valid = value && (!url || parseXPostId(url) === value.id)
    for (const video of container.querySelectorAll('video')) video.pause()
    container.replaceChildren(
      valid ? renderPost(value, mediaResolver) : renderFallback(pending.get()),
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
    resolveMediaUrl: { default: null, attribute: false },
    revision: { default: null, attribute: false },
  }),
)
