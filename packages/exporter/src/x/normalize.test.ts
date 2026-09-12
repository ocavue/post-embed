import { XPostSchema } from '@post-embed/schema'
import { describe, expect, it } from 'vitest'

import { extractTweetResults } from './extract.ts'
import type { GraphQLTweet } from './graphql.ts'
import { toISODate, toXPost, unwrapTweetResult } from './normalize.ts'
import { segmentsToText } from './segments.ts'
import homeTimeline from './testing/fixtures/HomeTimeline.json' with { type: 'json' }
import tweetDetail from './testing/fixtures/TweetDetail.json' with { type: 'json' }

function findTweet(root: unknown, restId: string): GraphQLTweet {
  const tweet = extractTweetResults(root).find(
    (item) => item.rest_id === restId,
  )
  if (!tweet) throw new Error(`Fixture has no tweet ${restId}`)
  return tweet
}

describe('toISODate', () => {
  it('converts the legacy created_at format', () => {
    expect(toISODate('Wed Oct 10 20:19:24 +0000 2018')).toBe(
      '2018-10-10T20:19:24.000Z',
    )
  })

  it('applies a non-zero offset', () => {
    expect(toISODate('Wed Oct 10 20:19:24 +0800 2018')).toBe(
      '2018-10-10T12:19:24.000Z',
    )
    expect(toISODate('Wed Oct 10 20:19:24 -0130 2018')).toBe(
      '2018-10-10T21:49:24.000Z',
    )
  })

  it('falls back to Date.parse and to an empty string', () => {
    expect(toISODate('2024-01-01T00:00:00Z')).toBe('2024-01-01T00:00:00.000Z')
    expect(toISODate('not a date')).toBe('')
    expect(toISODate(undefined)).toBe('')
  })
})

describe('toXPost', () => {
  it('maps a text post from a new-shape user', () => {
    const capture = toXPost(findTweet(homeTimeline, '1000000000000000001'))
    expect(capture).toBeDefined()
    const post = capture!.post
    expect(post).toEqual({
      id: '1000000000000000001',
      createdAt: '2018-10-10T20:19:24.000Z',
      lang: 'en',
      author: {
        name: 'Ada Example',
        handle: 'ada',
        avatar: 'https://pbs.twimg.com/profile_images/11/ada_normal.jpg',
        verified: 'blue',
      },
      body: [
        { type: 'text', text: 'Reading responses with ' },
        { type: 'link', text: '#hooks', url: 'https://x.com/hashtag/hooks' },
        { type: 'text', text: ' ' },
        { type: 'link', text: 'example.com', url: 'https://example.com/' },
      ],
    })
    expect(capture!.protected).toBe(false)
  })

  it('maps a legacy-shape user, video media and a quoted post', () => {
    const post = toXPost(findTweet(homeTimeline, '1000000000000000002'))!.post
    expect(post.author).toEqual({
      name: 'Legacy Shape',
      handle: 'legacy',
      avatar: 'https://pbs.twimg.com/profile_images/12/legacy_normal.jpg',
      verified: 'business',
    })
    expect(post.body).toEqual([{ type: 'text', text: 'Quoting with video' }])
    expect(post.media).toEqual([
      {
        type: 'video',
        poster:
          'https://pbs.twimg.com/ext_tw_video_thumb/1000000000000000020/pu/img/poster.jpg',
        width: 1280,
        height: 720,
        sources: [
          {
            url: 'https://video.twimg.com/ext_tw_video/1000000000000000020/pu/pl/index.m3u8?tag=12',
            type: 'application/x-mpegURL',
          },
          {
            url: 'https://video.twimg.com/ext_tw_video/1000000000000000020/pu/vid/640x360/video.mp4?tag=12',
            type: 'video/mp4',
            bitrate: 832000,
          },
          {
            url: 'https://video.twimg.com/ext_tw_video/1000000000000000020/pu/vid/1280x720/video.mp4?tag=12',
            type: 'video/mp4',
            bitrate: 2176000,
          },
        ],
      },
    ])
    expect(post.quote).toEqual({
      id: '1000000000000000003',
      createdAt: '2024-01-01T08:00:00.000Z',
      lang: 'en',
      author: {
        name: 'Ada Example',
        handle: 'ada',
        avatar: 'https://pbs.twimg.com/profile_images/11/ada_normal.jpg',
        verified: 'blue',
      },
      body: [{ type: 'text', text: 'Quoted photo' }],
      media: [
        {
          type: 'photo',
          url: 'https://pbs.twimg.com/media/quote1.jpg',
          width: 800,
          height: 600,
          alt: 'A quoted photo',
        },
      ],
    })
  })

  it('reports a protected author and maps the affiliation label', () => {
    const capture = toXPost(findTweet(homeTimeline, '1000000000000000005'))!
    expect(capture.protected).toBe(true)
    expect(capture.post.author).toEqual({
      name: 'Protected Person',
      handle: 'protected',
      avatar: 'https://pbs.twimg.com/profile_images/13/protected_normal.jpg',
      avatarShape: 'square',
      verified: 'government',
      label: {
        text: 'Example Org',
        badge: 'https://pbs.twimg.com/profile_images/badge_bigger.jpg',
        url: 'https://x.com/exampleorg',
      },
    })
  })

  it('uses the full note text and keeps the media', () => {
    const post = toXPost(findTweet(tweetDetail, '2000000000000000001'))!.post
    const text = segmentsToText(post.body)
    expect(text.startsWith('A long post keeps')).toBe(true)
    expect(text.endsWith('😀 Done.')).toBe(true)
    expect(Array.from(text).length).toBeGreaterThan(280)
    expect(text).not.toContain('t.co')
    expect(post.body[1]).toEqual({
      type: 'link',
      text: 'example.com/long',
      url: 'https://example.com/long',
    })
    expect(post.truncated).toBeUndefined()
    expect(post.media).toEqual([
      {
        type: 'photo',
        url: 'https://pbs.twimg.com/media/long1.jpg',
        width: 1500,
        height: 1000,
        alt: 'A photo under a long post',
      },
    ])
  })

  it('keeps the truncated legacy text when the note result has no text', () => {
    const long = findTweet(tweetDetail, '2000000000000000001')
    const post = toXPost({
      ...long,
      note_tweet: { note_tweet_results: { result: { id: 'note' } } },
    })!.post
    const text = segmentsToText(post.body)
    expect(text.startsWith('A long post keeps')).toBe(true)
    expect(text.endsWith('never cut it at…')).toBe(true)
    expect(post.truncated).toBe(true)
    expect(post.media).toHaveLength(1)
  })

  it('reads edit_control_initial for an edited post', () => {
    const edited = findTweet(tweetDetail, '2000000000000000001')
    expect(toXPost(edited)!.post.edit).toBe('edited')
    const stale = toXPost({ ...edited, rest_id: '2000000000000000000' })!.post
    expect(stale.edit).toBe('stale')
    expect(
      toXPost(findTweet(homeTimeline, '1000000000000000001'))!.post.edit,
    ).toBeUndefined()
  })

  it('maps the reply target and hides the leading mention', () => {
    const post = toXPost(findTweet(tweetDetail, '2000000000000000002'))!.post
    expect(post.replyTo).toEqual({
      handle: 'ada',
      id: '2000000000000000001',
    })
    expect(post.body).toEqual([{ type: 'text', text: 'Nice long post' }])
  })

  it('returns undefined when the author is unavailable', () => {
    expect(
      toXPost(findTweet(tweetDetail, '2000000000000000004')),
    ).toBeUndefined()
  })

  it('produces output that passes XPostSchema without fallbacks', () => {
    for (const result of extractTweetResults(homeTimeline)) {
      const capture = toXPost(result)
      if (!capture) continue
      const validated = XPostSchema['~standard'].validate(capture.post)
      if (validated instanceof Promise) throw new Error('sync schema expected')
      if (validated.issues) throw new Error('unexpected schema issues')
      expect(validated.value).toEqual(capture.post)
    }
  })
})

describe('unwrapTweetResult', () => {
  it('accepts a tweet and unwraps a visibility wrapper', () => {
    const tweet = findTweet(homeTimeline, '1000000000000000001')
    expect(unwrapTweetResult(tweet)).toEqual(tweet)
    expect(
      unwrapTweetResult({ __typename: 'TweetWithVisibilityResults', tweet }),
    ).toEqual(tweet)
  })

  it('rejects tombstones, unavailable posts and partial objects', () => {
    expect(unwrapTweetResult({ __typename: 'TweetTombstone' })).toBeUndefined()
    expect(
      unwrapTweetResult({ __typename: 'TweetUnavailable' }),
    ).toBeUndefined()
    expect(
      unwrapTweetResult({ __typename: 'Tweet', rest_id: '1', legacy: {} }),
    ).toBeUndefined()
    expect(unwrapTweetResult('tweet')).toBeUndefined()
    expect(unwrapTweetResult(null)).toBeUndefined()
  })
})
