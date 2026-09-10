import type { MediaDetails } from '@post-embed/types/internal/tweet/media'
import type { TweetPhoto } from '@post-embed/types/internal/tweet/photo'
import type { TweetVideo } from '@post-embed/types/internal/tweet/video'
import { html, nothing, render } from 'lit-html'
import { ifDefined } from 'lit-html/directives/if-defined.js'

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

function showMediaError(element: HTMLElement) {
  element.hidden = true
  const message = element
    .closest('[data-media-item]')
    ?.querySelector<HTMLElement>('[data-media-error]')
  if (message) message.hidden = false
}
function onMediaError(event: Event) {
  const target = event.currentTarget as HTMLElement
  if (target.tagName === 'SOURCE') {
    target.dataset.failed = ''
    const video = target.parentElement!
    if (
      Array.from(video.querySelectorAll('source')).every((item) => {
        return item.hasAttribute('data-failed')
      })
    )
      showMediaError(video)
  } else {
    showMediaError(target.tagName === 'IMG' ? target.parentElement! : target)
  }
}

function renderSource(source: Media['sources'][number]) {
  return html`<source
    src=${source.url}
    type=${source.type}
    @error=${onMediaError}
  />`
}

function renderItem(media: Media, permalink?: string) {
  if (
    media.unavailable ||
    (media.type === 'photo' ? !media.poster : media.sources.length === 0)
  ) {
    return html`<div data-media-unavailable>
      Media unavailable. ${renderLink('View on X', permalink)}
    </div>`
  }
  return html`<div data-media-item>
    ${
      media.type === 'photo'
        ? html`<a
            href=${media.poster!}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src=${media.poster!}
              alt=${media.alt}
              width=${ifDefined(dimension(media.width))}
              height=${ifDefined(dimension(media.height))}
              loading="lazy"
              decoding="async"
              referrerpolicy="no-referrer"
              @error=${onMediaError}
            />
          </a>`
        : html`<video
            controls
            playsinline
            preload="none"
            aria-label=${media.alt}
            poster=${ifDefined(media.poster)}
            width=${ifDefined(dimension(media.width))}
            height=${ifDefined(dimension(media.height))}
            ?loop=${media.type === 'animated_gif'}
            .muted=${media.type === 'animated_gif'}
            @error=${onMediaError}
          >
            ${media.sources.map(renderSource)}
            ${renderLink('Watch on X', permalink)}
          </video>`
    }
    <div data-media-error hidden>
      Media could not be loaded. ${renderLink('View on X', permalink)}
    </div>
  </div>`
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
  if (media.length === 0) return nothing
  const gallery = () => {
    return html`<div data-media data-count=${media.length}>
      ${media.map((item) => renderItem(item, permalink))}
    </div>`
  }
  // Do not insert image/video URLs until the reader opts in.
  return sensitive
    ? html`<div data-sensitive>
        <button
          type="button"
          @click=${(event: Event) => {
            const button = event.currentTarget as HTMLButtonElement
            const container = button.nextElementSibling as HTMLElement
            render(gallery(), container)
            button.hidden = true
          }}
        >
          Show potentially sensitive media
        </button>
        <div data-sensitive-content></div>
      </div>`
    : gallery()
}
