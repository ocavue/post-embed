import './theme.css'

import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import { createPhoto, createTweet } from './testing/fixtures.ts'

import { registerXPost } from './index.ts'

beforeAll(() => registerXPost())
afterEach(() => {
  document.body.replaceChildren()
  vi.restoreAllMocks()
})

function mount(tweet = createTweet()) {
  tweet.user.profile_image_url_https = ''
  const element = document.createElement('post-embed-x-post')
  element.dataset.testid = 'feature-post'
  element.data = tweet
  document.body.append(element)
  return element
}
const post = page.getByTestId('feature-post')

function video(gif = false) {
  return {
    ...createPhoto(),
    type: gif ? ('animated_gif' as const) : ('video' as const),
    video_info: {
      aspect_ratio: [8, 5] as [number, number],
      variants: [
        {
          content_type: 'application/x-mpegURL' as const,
          url: 'https://example.com/video.m3u8',
        },
        {
          content_type: 'video/mp4' as const,
          bitrate: 200,
          url: 'https://example.com/high.mp4',
        },
        {
          content_type: 'video/mp4' as const,
          bitrate: 100,
          url: 'https://example.com/low.mp4',
        },
      ],
    },
  }
}

describe('Full tweet snapshots', () => {
  it('renders photos with alt text and preserves native full-image links', async () => {
    expect(createPhoto().media_url_https).toMatch(/^https?:/u)
    const tweet = createTweet('Four pictures')
    tweet.mediaDetails = Array.from({ length: 4 }, createPhoto)
    const element = mount(tweet)
    await expect.element(post.getByText('Four pictures')).toBeVisible()
    const images =
      element.querySelectorAll<HTMLImageElement>('[data-media] img')
    expect(images).toHaveLength(4)
    expect(images[0].alt).toBe('Blue illustrated mountains')
    expect(images[0].closest('a')?.href).toBe(images[0].src)
    await expect.poll(() => images[0].naturalWidth).toBe(640)
  })

  it('uses MP4 before HLS, native controls, and opt-in GIF playback', async () => {
    const tweet = createTweet()
    tweet.mediaDetails = [video(), video(true)]
    const element = mount(tweet)
    await expect
      .element(post.getByText('Hello 😀', { exact: false }))
      .toBeVisible()
    const videos = element.querySelectorAll('video')
    expect(videos).toHaveLength(2)
    expect(videos[0].querySelector('source')?.src).toBe(
      'https://example.com/high.mp4',
    )
    expect(videos[0].controls).toBe(true)
    expect(videos[0].preload).toBe('none')
    expect(videos[0].autoplay).toBe(false)
    expect(videos[0].loop).toBe(false)
    expect(videos[1].loop).toBe(true)
    expect(videos[1].muted).toBe(true)
    expect(videos[1].autoplay).toBe(false)
    const pause = vi.spyOn(videos[0], 'pause')
    element.remove()
    expect(pause).toHaveBeenCalled()
    tweet.mediaDetails = [createPhoto()]
    element.data = { ...tweet }
    document.body.append(element)
    expect(element.querySelector('video')).toBeNull()
  })

  it('renders quotes, reply context, and long-post links', async () => {
    const tweet = createTweet('A reply with a quote')
    tweet.quoted_tweet = {
      ...createTweet('Quote body'),
      id_str: '222',
      reply_count: 1,
      retweet_count: 2,
      self_thread: { id_str: '222' },
      mediaDetails: [createPhoto()],
    }
    tweet.in_reply_to_screen_name = 'example'
    tweet.in_reply_to_status_id_str = '111'
    tweet.note_tweet = { id: '333' }
    mount(tweet)
    await expect
      .element(
        post
          .getByRole('article', { name: 'Quoted post' })
          .getByText('Quote body'),
      )
      .toBeVisible()
    await expect
      .element(post.getByRole('link', { name: 'Replying to @example' }))
      .toHaveAttribute('href', 'https://x.com/example/status/111')
    await expect
      .element(post.getByRole('link', { name: 'Show more' }))
      .toBeVisible()
  })

  it('renders badges, UTC dates, edits, follow and engagement links', async () => {
    const tweet = createTweet()
    tweet.user.verified_type = 'Business'
    tweet.user.highlighted_label = {
      description: 'Organization',
      user_label_type: 'BusinessLabel',
      user_label_display_type: 'Badge',
    }
    tweet.isEdited = true
    tweet.favorite_count = 1200
    tweet.conversation_count = 1
    const element = mount(tweet)
    await expect
      .element(post.getByRole('img', { name: 'Business verified account' }))
      .toBeVisible()
    await expect.element(post.getByText('Organization')).toBeVisible()
    expect(element.querySelector('time')?.dateTime).toBe(
      '2026-09-10T00:00:00.000Z',
    )
    await expect
      .element(post.getByText('Edited', { exact: true }))
      .toBeVisible()
    await expect
      .element(post.getByRole('link', { name: 'Follow', exact: true }))
      .toHaveAttribute(
        'href',
        'https://x.com/intent/follow?screen_name=example',
      )
    await expect
      .element(post.getByRole('link', { name: 'Like · 1.2K' }))
      .toHaveAttribute(
        'href',
        'https://x.com/intent/like?tweet_id=1234567890123456789',
      )
    await expect
      .element(post.getByRole('link', { name: 'Read 1 reply on X' }))
      .toBeVisible()
  })

  it('reports clipboard success and failure without claiming a failed copy worked', async () => {
    const copy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue()
    mount()
    await post.getByRole('button', { name: 'Copy link' }).click()
    await expect
      .element(post.getByRole('status'))
      .toHaveTextContent('Link copied.')
    expect(copy).toHaveBeenCalledWith(
      'https://x.com/example/status/1234567890123456789',
    )
    copy.mockRejectedValue(new Error('Denied'))
    await post.getByRole('button', { name: 'Copy link' }).click()
    await expect
      .element(post.getByRole('status'))
      .toHaveTextContent('Could not copy. Use the View on X link.')
  })

  it('rejects unsafe media URLs and survives missing media and invalid dates', async () => {
    const tweet = createTweet()
    tweet.created_at = 'bad-date'
    tweet.mediaDetails = [
      { ...createPhoto(), media_url_https: 'javascript:alert(1)' },
      { ...video(), video_info: { aspect_ratio: [1, 1], variants: [] } },
    ]
    const element = mount(tweet)
    expect(element.querySelector('[data-media] img, video, time')).toBeNull()
    expect(element.querySelectorAll('[data-media-unavailable]')).toHaveLength(2)
    tweet.mediaDetails = [createPhoto()]
    element.data = { ...tweet }
    const image = element.querySelector<HTMLImageElement>('[data-media] img')!
    image.dispatchEvent(new Event('error'))
    await expect
      .element(post.getByText('Media could not be loaded.', { exact: false }))
      .toBeVisible()
  })

  it('handles video source errors and falls back to legacy photo/video fields', async () => {
    const tweet = createTweet()
    tweet.photos = [
      {
        url: createPhoto().media_url_https,
        expandedUrl: 'https://example.com/',
        width: 640,
        height: 400,
        cropCandidates: [],
        backgroundColor: { red: 0, green: 0, blue: 0 },
      },
    ]
    tweet.video = {
      aspectRatio: [8, 5],
      contentType: 'video/mp4',
      durationMs: 1000,
      mediaAvailability: { status: 'Available' },
      poster: createPhoto().media_url_https,
      variants: [{ type: 'video/mp4', src: 'https://example.com/video.mp4' }],
      videoId: { type: 'tweet', id: '1' },
      viewCount: 0,
    }
    const element = mount(tweet)
    expect(element.querySelectorAll('[data-media-item]')).toHaveLength(2)
    element.querySelector('source')!.dispatchEvent(new Event('error'))
    await expect
      .element(
        post.getByText('Media could not be loaded.', { exact: false }).nth(1),
      )
      .toBeVisible()
    expect(element.querySelector('video')?.hidden).toBe(true)
  })
})
