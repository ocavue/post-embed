import {
  defineCustomElement,
  defineProps,
  type HostElement,
  type State,
  useEffect as useHostEffect,
} from '@aria-ui/core'
import { XPostSchema } from '@post-embed/schema'
import { parseXPostId, type XMediaUrlPolicy, type XPost as XPostSnapshot } from '@post-embed/types'
import el from 'crelt'

import { type FetchProps, useFetch } from '../fetch.ts'
import { getRootContainer } from '../root.ts'
import { assumeNotPromise } from '../utils.ts'

import { renderPost } from './render-post.ts'

export interface XPostProps extends FetchProps<XPostSnapshot> {
  mediaUrlPolicy: XMediaUrlPolicy | null
  revision: string | number | null
}

export interface XPostElement extends HTMLElement, XPostProps {}

/** @internal */
export function useXPost(host: HostElement, props: State<XPostProps>): void {
  const { fetched, pending } = useFetch(host, props, 'X post', () => props.revision.get())

  let renderedUrl: string | null = null
  let renderedPolicy: XMediaUrlPolicy | null = null
  let renderedResolver: XPostProps['resolver'] = null
  useHostEffect(host, () => () => {
    for (const video of getRootContainer(host).querySelectorAll('video')) video.pause()
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

    const policy = props.mediaUrlPolicy.get()
    const url = props.url.get()
    const value = result && !result.issues ? result.value : undefined
    const valid = value && (!url || parseXPostId(url) === value.id)
    const resolver = props.resolver.get()
    const sameSource = renderedUrl === url && renderedPolicy === policy && renderedResolver === resolver
    if (pending.get() && sameSource && container.querySelector('video')) return
    renderedUrl = url
    renderedPolicy = policy
    renderedResolver = resolver
    const next = valid ? renderPost(value, policy) : renderFallback(pending.get())
    const previousVideos = new Map<string, HTMLVideoElement>()
    for (const video of container.querySelectorAll('video')) {
      if (video.dataset.loadFailed) continue
      const key = Array.from(video.querySelectorAll('source')).map((source) => source.src).join('|')
      if (key) previousVideos.set(key, video)
    }
    const resume: HTMLVideoElement[] = []
    for (const video of next.querySelectorAll('video')) {
      const key = Array.from(video.querySelectorAll('source')).map((source) => source.src).join('|')
      const previous = sameSource ? previousVideos.get(key) : undefined
      if (previous) {
        if (!previous.paused) resume.push(previous)
        previous.poster = video.poster
        video.replaceWith(previous)
        previousVideos.delete(key)
      }
    }
    for (const video of previousVideos.values()) video.pause()
    container.replaceChildren(next)
    for (const video of resume) void video.play().catch(() => {})
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
    mediaUrlPolicy: { default: null, attribute: false },
    revision: { default: null, attribute: false },
  }),
)
