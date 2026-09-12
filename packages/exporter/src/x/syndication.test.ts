import { XPostSchema } from '@post-embed/schema'
import type { Tweet } from '@post-embed/types'
import { describe, expect, it } from 'vitest'

import { fromSyndication, fromSyndicationTweet } from './syndication.ts'
import photoAndVideo from './testing/syndication/1577855540407197696.json' with { type: 'json' }
import video from './testing/syndication/1600009574919962625.json' with { type: 'json' }
import vercel from './testing/syndication/1683920951807971329.json' with { type: 'json' }
import jack from './testing/syndication/20.json' with { type: 'json' }

function tweet(): Tweet {
  return structuredClone(jack) as unknown as Tweet
}

describe('fromSyndication', () => {
  it('maps a text post', () => {
    expect(fromSyndication(jack)).toEqual({
      id: '20',
      createdAt: '2006-03-21T20:50:14.000Z',
      lang: 'en',
      author: {
        name: 'jack',
        handle: 'jack',
        avatar:
          'https://pbs.twimg.com/profile_images/1661201415899951105/azNjKOSH_normal.jpg',
        verified: 'blue',
        label: {
          text: 'Square',
          badge:
            'https://pbs.twimg.com/profile_images/1285655593592791040/HtwPZgej_bigger.jpg',
          url: 'https://twitter.com/Square',
        },
      },
      body: [{ type: 'text', text: 'just setting up my twttr' }],
    })
  })

  it('maps a video post and cuts the media link off the body', () => {
    const post = fromSyndication(video)!
    expect(post.body).toEqual([
      { type: 'text', text: 'This is a genius ad by Apple. 🔥🔥🔥🔥🔥' },
    ])
    expect(post.author).toEqual({
      name: 'S H I N O B I',
      handle: 'MunTheShinobi',
      avatar:
        'https://pbs.twimg.com/profile_images/2029818588333277184/nuBhZ5pt_normal.jpg',
      verified: 'blue',
    })
    expect(post.media).toHaveLength(1)
    const media = post.media![0]
    if (media.type !== 'video') throw new Error('expected a video')
    expect(media.unavailable).toBeUndefined()
    expect(media.poster).toBe(
      'https://pbs.twimg.com/ext_tw_video_thumb/1600009362759733248/pu/img/XVhFQivj75H_YxxV.jpg',
    )
    expect([media.width, media.height]).toEqual([1280, 720])
    expect(
      media.sources.map((source) => [source.type, source.bitrate]),
    ).toEqual([
      ['application/x-mpegURL', undefined],
      ['video/mp4', 256000],
      ['video/mp4', 832000],
      ['video/mp4', 2176000],
    ])
  })

  it('reads every item from mediaDetails', () => {
    const post = fromSyndication(photoAndVideo)!
    expect(post.body).toEqual([
      {
        type: 'text',
        text: 'gm ✨️ now I can post image and video. nice update.',
      },
    ])
    expect(
      post.media?.map((item) => [item.type, item.width, item.height]),
    ).toEqual([
      ['photo', 1536, 1920],
      ['video', 720, 900],
    ])
    expect(post.author.verified).toBeUndefined()
  })

  it('decodes character references and keeps the link display text', () => {
    const post = fromSyndication(vercel)!
    expect(post.body[0]).toEqual({
      type: 'text',
      text: 'Introducing `react-tweet`:\n\n◆ 35x less client-side JavaScript than the Twitter <iframe>\n◆ React Server Components for built-in data fetching\n◆ Works with Next.js, Vite, CRA, and more\n\n',
    })
    expect(post.body[1]).toEqual({
      type: 'link',
      text: 'vercel.com/blog/introduci…',
      url: 'https://vercel.com/blog/introducing-react-tweet',
    })
    expect(post.author).toMatchObject({
      handle: 'vercel',
      avatarShape: 'square',
      verified: 'business',
    })
    expect(post).not.toHaveProperty('card')
    expect(post.media).toBeUndefined()
  })

  it('returns undefined for a tombstone and for junk', () => {
    expect(
      fromSyndication({ __typename: 'TweetTombstone', tombstone: {} }),
    ).toBeUndefined()
    expect(fromSyndication({})).toBeUndefined()
    expect(fromSyndication(null)).toBeUndefined()
  })

  it('falls back to photos and video when mediaDetails is absent', () => {
    const input = tweet()
    input.photos = [
      {
        url: 'https://pbs.twimg.com/media/a.jpg',
        expandedUrl: 'https://x.com/jack/status/20/photo/1',
        width: 640,
        height: 400,
        backgroundColor: { red: 0, green: 0, blue: 0 },
        cropCandidates: [],
      },
    ]
    input.video = {
      aspectRatio: [16, 9],
      contentType: 'media_entity',
      durationMs: 1000,
      mediaAvailability: { status: 'available' },
      poster: 'https://pbs.twimg.com/poster.jpg',
      variants: [
        {
          type: 'application/vnd.apple.mpegurl',
          src: 'https://v.example/a.m3u8',
        },
        { type: 'video/mp4', src: 'https://v.example/a.mp4' },
        { type: 'video/webm', src: 'https://v.example/a.webm' },
      ],
      videoId: { type: 'tweet', id: '20' },
      viewCount: 0,
    }
    expect(fromSyndicationTweet(input).media).toEqual([
      {
        type: 'photo',
        url: 'https://pbs.twimg.com/media/a.jpg',
        width: 640,
        height: 400,
      },
      {
        type: 'video',
        poster: 'https://pbs.twimg.com/poster.jpg',
        width: 1600,
        height: 900,
        sources: [
          { url: 'https://v.example/a.m3u8', type: 'application/x-mpegURL' },
          { url: 'https://v.example/a.mp4', type: 'video/mp4' },
        ],
      },
    ])
    input.video.mediaAvailability.status = 'Unavailable'
    input.video.contentType = 'animated_gif'
    expect(fromSyndicationTweet(input).media?.[1]).toMatchObject({
      type: 'gif',
      unavailable: true,
    })
  })

  it('maps the quote, the reply target, edits and truncation', () => {
    const input = tweet()
    input.quoted_tweet = {
      ...tweet(),
      id_str: '21',
      text: 'Quoted &amp; saved',
      display_text_range: [0, 18],
      reply_count: 0,
      retweet_count: 0,
      favorite_count: 0,
      self_thread: { id_str: '21' },
    }
    input.in_reply_to_screen_name = 'biz'
    input.in_reply_to_status_id_str = '19'
    input.isEdited = true
    input.note_tweet = { id: 'note' }
    const post = fromSyndicationTweet(input)
    expect(post.quote).toMatchObject({
      id: '21',
      body: [{ type: 'text', text: 'Quoted & saved' }],
    })
    expect(post.quote).not.toHaveProperty('quote')
    expect(post.replyTo).toEqual({ handle: 'biz', id: '19' })
    expect(post.edit).toBe('edited')
    expect(post.truncated).toBe(true)
    input.isStaleEdit = true
    expect(fromSyndicationTweet(input).edit).toBe('stale')
  })

  it('produces output that passes XPostSchema unchanged', () => {
    for (const input of [jack, video, photoAndVideo, vercel]) {
      const post = fromSyndication(input)
      const validated = XPostSchema['~standard'].validate(post)
      if (validated instanceof Promise) throw new Error('sync schema expected')
      if (validated.issues) throw new Error('unexpected schema issues')
      expect(validated.value).toEqual(post)
    }
  })
})
