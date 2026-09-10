import type { MediaDetails } from '@post-embed/types/internal/tweet/media'
import type { TweetPhoto } from '@post-embed/types/internal/tweet/photo'
import type { TweetVideo } from '@post-embed/types/internal/tweet/video'
import el from 'crelt'

import { renderLink } from './render-shared.ts'
import { getSafeUrl } from './safe-url.ts'

interface Media {
  type: 'photo' | 'video' | 'animated_gif'
  poster?: string
  alt: string
  width: number
  height: number
  unavailable: boolean
  sources: { url: string; type: string }[]
}

function dimension(value: number): number | undefined {
  return Number.isFinite(value) && value > 0 ? Math.round(value) : undefined
}

function normalizeMedia(media: MediaDetails): Media {
  return {
    type: media.type,
    poster: getSafeUrl(media.media_url_https),
    alt:
      media.type === 'photo'
        ? media.ext_alt_text || 'Post image'
        : media.type === 'animated_gif'
          ? 'Animated GIF'
          : 'Post video',
    width: media.original_info.width,
    height: media.original_info.height,
    unavailable: Boolean(
      media.ext_media_availability.status &&
      media.ext_media_availability.status !== 'Available',
    ),
    sources:
      media.type === 'photo'
        ? []
        : media.video_info.variants
            .filter((variant) => getSafeUrl(variant.url))
            .sort((a, b) => {
              return (
                Number(b.content_type === 'video/mp4') -
                  Number(a.content_type === 'video/mp4') ||
                (b.bitrate || 0) - (a.bitrate || 0)
              )
            })
            .map((variant) => ({
              url: variant.url,
              type: variant.content_type,
            })),
  }
}

function renderItem(media: Media, permalink?: string) {
  if (
    media.unavailable ||
    (media.type === 'photo' ? !media.poster : media.sources.length === 0)
  ) {
    return el(
      'div',
      { 'data-media-unavailable': '' },
      'Media unavailable. ',
      renderLink('View on X', permalink),
    )
  }

  const error = el(
    'div',
    { 'data-media-error': '', hidden: true },
    'Media could not be loaded. ',
    renderLink('View on X', permalink),
  )
  let content: HTMLAnchorElement | HTMLVideoElement
  if (media.type === 'photo') {
    const image = el('img', {
      src: media.poster!,
      alt: media.alt,
      width: dimension(media.width),
      height: dimension(media.height),
      loading: 'lazy',
      decoding: 'async',
      referrerpolicy: 'no-referrer',
    })
    const link = el(
      'a',
      {
        href: media.poster!,
        target: '_blank',
        rel: 'noopener noreferrer',
      },
      image,
    )
    image.addEventListener('error', () => {
      link.hidden = true
      error.hidden = false
    })
    content = link
  } else {
    const sources = media.sources.map((source) => {
      return el('source', { src: source.url, type: source.type })
    })
    const video = el(
      'video',
      {
        controls: true,
        playsInline: true,
        preload: 'none',
        'aria-label': media.alt,
        poster: media.poster,
        width: dimension(media.width),
        height: dimension(media.height),
        loop: media.type === 'animated_gif',
      },
      sources,
      renderLink('Watch on X', permalink),
    )
    video.muted = media.type === 'animated_gif'
    const showError = () => {
      video.hidden = true
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
  return el('div', { 'data-media-item': '' }, content, error)
}

export function renderMedia(
  tweet: {
    mediaDetails?: MediaDetails[]
    photos?: TweetPhoto[]
    video?: TweetVideo
  },
  permalink?: string,
  sensitive = false,
) {
  const media = tweet.mediaDetails?.map(normalizeMedia) || []
  if (media.length === 0) {
    for (const photo of tweet.photos || []) {
      media.push({
        type: 'photo',
        poster: getSafeUrl(photo.url),
        alt: 'Post image',
        width: photo.width,
        height: photo.height,
        unavailable: false,
        sources: [],
      })
    }
    if (tweet.video) {
      const video = tweet.video
      media.push({
        type: video.contentType === 'animated_gif' ? 'animated_gif' : 'video',
        poster: getSafeUrl(video.poster),
        alt: 'Post video',
        width: video.aspectRatio[0] * 100,
        height: video.aspectRatio[1] * 100,
        unavailable: Boolean(
          video.mediaAvailability.status &&
          video.mediaAvailability.status !== 'Available',
        ),
        sources: video.variants.flatMap((variant) => {
          const url = getSafeUrl(variant.src)
          const type =
            variant.type === 'video/mp4'
              ? 'video/mp4'
              : [
                    'application/x-mpegURL',
                    'application/vnd.apple.mpegurl',
                  ].includes(variant.type)
                ? 'application/x-mpegURL'
                : undefined
          return url && type ? [{ url, type }] : []
        }),
      })
    }
  }
  if (media.length === 0) return
  const gallery = () => {
    return el(
      'div',
      { 'data-media': '', 'data-count': String(media.length) },
      media.map((item) => renderItem(item, permalink)),
    )
  }
  if (!sensitive) return gallery()

  // Do not create image/video URLs until the reader opts in.
  const button = el(
    'button',
    { type: 'button' },
    'Show potentially sensitive media',
  )
  const content = el('div', { 'data-sensitive-content': '' })
  button.addEventListener(
    'click',
    () => {
      content.replaceChildren(gallery())
      button.hidden = true
    },
    { once: true },
  )
  return el('div', { 'data-sensitive': '' }, button, content)
}
