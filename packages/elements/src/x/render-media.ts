import type { XPostMedia, XMediaUrlPolicy } from '@post-embed/types'
import el from 'crelt'

import { renderLink } from '../render-link.ts'

import { getMediaUrl } from './media-url.ts'

function dimension(value: number): number | undefined {
  return Number.isFinite(value) && value > 0 ? Math.round(value) : undefined
}

function renderUnavailable(permalink?: string) {
  return el(
    'div',
    { 'data-media-unavailable': '' },
    'Media unavailable. ',
    renderLink('View on X', permalink),
  )
}

function renderItem(
  media: XPostMedia,
  policy: XMediaUrlPolicy | null,
  permalink?: string,
) {
  const error = el(
    'div',
    { 'data-media-error': '', hidden: true },
    'Media could not be loaded. ',
    renderLink('View on X', permalink),
  )
  let content: HTMLAnchorElement | HTMLVideoElement
  if (media.type === 'photo') {
    const url = getMediaUrl(media.url, policy)
    if (media.unavailable || !url) return renderUnavailable(permalink)
    const image = el('img', {
      src: url,
      alt: media.alt ?? '',
      width: dimension(media.width),
      height: dimension(media.height),
      loading: 'lazy',
      decoding: 'async',
      referrerpolicy: 'no-referrer',
    })
    const link = el(
      'a',
      { href: url, target: '_blank', rel: 'noopener noreferrer' },
      image,
    )
    image.addEventListener('error', () => {
      link.hidden = true
      image.dataset.loadFailed = 'true'
      error.hidden = false
    })
    content = link
  } else {
    const sources = media.sources
      .flatMap((source) => {
        const url = getMediaUrl(source.url, policy)
        return url ? [{ ...source, url }] : []
      })
      .sort((a, b) => {
        return (
          Number(b.type === 'video/mp4') - Number(a.type === 'video/mp4') ||
          (b.bitrate || 0) - (a.bitrate || 0)
        )
      })
      .map((source) => el('source', { src: source.url, type: source.type }))
    if (media.unavailable || sources.length === 0) {
      return renderUnavailable(permalink)
    }
    const gif = media.type === 'gif'
    const video = el(
      'video',
      {
        controls: true,
        playsInline: true,
        preload: 'none',
        'aria-label': gif ? 'Animated GIF' : 'Post video',
        poster: media.poster && getMediaUrl(media.poster, policy),
        width: dimension(media.width),
        height: dimension(media.height),
        loop: gif,
      },
      sources,
      renderLink('Watch on X', permalink),
    )
    video.muted = gif
    const showError = () => {
      video.hidden = true
      video.dataset.loadFailed = 'true'
      error.hidden = false
    }
    video.addEventListener('error', showError)
    let failedSources = 0
    for (const source of sources) {
      source.addEventListener(
        'error',
        () => {
          failedSources++
          if (failedSources === sources.length) showError()
        },
        { once: true },
      )
    }
    content = video
  }
  const item = el('div', { 'data-media-item': '' }, content, error)
  const retry = el('button', { type: 'button' }, 'Retry media')
  retry.addEventListener('click', () => {
    if (content instanceof HTMLVideoElement) content.pause()
    item.replaceWith(renderItem(media, policy, permalink))
  })
  error.append(retry)
  return item
}

export function renderMedia(
  media: XPostMedia[] | undefined,
  policy: XMediaUrlPolicy | null,
  permalink?: string,
) {
  if (!media?.length) return
  return el(
    'div',
    { 'data-media': '', 'data-count': String(media.length) },
    media.map((item) => renderItem(item, policy, permalink)),
  )
}
