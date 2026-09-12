import { TweetSchema } from '@post-embed/schema'
import { describe, expect, it } from 'vitest'

import { extractTweetResults } from './extract.ts'
import type { GraphQLTweet } from './graphql.ts'
import { toISODate, toTweet, unwrapTweetResult } from './normalize.ts'
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

describe('toTweet', () => {
  it('maps a text post from a new-shape user', () => {
    const capture = toTweet(findTweet(homeTimeline, '1000000000000000001'))
    expect(capture).toBeDefined()
    const tweet = capture!.tweet
    expect(tweet.id_str).toBe('1000000000000000001')
    expect(tweet.text).toBe('Reading responses with #hooks https://t.co/ex1')
    expect(tweet.display_text_range).toEqual([0, 43])
    expect(tweet.created_at).toBe('2018-10-10T20:19:24.000Z')
    expect(tweet.lang).toBe('en')
    expect(tweet.user).toMatchObject({
      id_str: '11',
      name: 'Ada Example',
      screen_name: 'ada',
      profile_image_url_https:
        'https://pbs.twimg.com/profile_images/11/ada_normal.jpg',
      profile_image_shape: 'Circle',
      verified: false,
      is_blue_verified: true,
    })
    expect(tweet.entities?.hashtags).toEqual([
      { indices: [21, 28], text: 'hooks' },
    ])
    expect(tweet.entities?.urls[0]?.expanded_url).toBe('https://example.com/')
    expect(tweet.favorite_count).toBe(12)
    expect(tweet.conversation_count).toBe(3)
    expect(tweet.isEdited).toBe(false)
    expect(tweet.note_tweet).toBeUndefined()
    expect(tweet.mediaDetails).toEqual([])
    expect(capture!.protected).toBe(false)
  })

  it('maps a legacy-shape user, video media and a quoted post', () => {
    const tweet = toTweet(findTweet(homeTimeline, '1000000000000000002'))!.tweet
    expect(tweet.user).toMatchObject({
      name: 'Legacy Shape',
      screen_name: 'legacy',
      verified: true,
      verified_type: 'Business',
    })
    expect(tweet.mediaDetails).toHaveLength(1)
    const media = tweet.mediaDetails![0]
    expect(media.type).toBe('video')
    expect(media.indices).toEqual([19, 42])
    expect(media.ext_media_color).toEqual({ palette: [] })
    if (media.type !== 'video') throw new Error('expected a video')
    expect(media.video_info.aspect_ratio).toEqual([16, 9])
    expect(
      media.video_info.variants.map((variant) => variant.content_type),
    ).toEqual(['application/x-mpegURL', 'video/mp4', 'video/mp4'])
    expect(tweet.video).toMatchObject({
      contentType: 'media_entity',
      durationMs: 139987,
      viewCount: 4321,
      videoId: { type: 'video', id: '7_1000000000000000020' },
    })
    expect(tweet.photos).toEqual([])
    expect(tweet.quoted_tweet).toMatchObject({
      id_str: '1000000000000000003',
      text: 'Quoted photo https://t.co/quote1',
      self_thread: { id_str: '1000000000000000003' },
      reply_count: 0,
      favorite_count: 5,
    })
    expect(tweet.quoted_tweet?.mediaDetails?.[0]).toMatchObject({
      type: 'photo',
      ext_alt_text: 'A quoted photo',
    })
  })

  it('reports a protected author and maps the business label', () => {
    const capture = toTweet(findTweet(homeTimeline, '1000000000000000005'))!
    expect(capture.protected).toBe(true)
    expect(capture.tweet.user).toMatchObject({
      profile_image_shape: 'Square',
      verified_type: 'Government',
      highlighted_label: {
        description: 'Example Org',
        badge: { url: 'https://pbs.twimg.com/profile_images/badge_bigger.jpg' },
        url: { url: 'https://x.com/exampleorg', url_type: 'DeepLink' },
        user_label_type: 'BusinessLabel',
        user_label_display_type: 'Badge',
      },
    })
  })

  it('uses the full note text and moves media indices past it', () => {
    const tweet = toTweet(findTweet(tweetDetail, '2000000000000000001'))!.tweet
    const length = Array.from(tweet.text).length
    expect(tweet.text.startsWith('A long post keeps')).toBe(true)
    expect(tweet.text.endsWith('😀 Done.')).toBe(true)
    expect(length).toBeGreaterThan(280)
    expect(tweet.display_text_range).toEqual([0, length])
    expect(tweet.note_tweet).toBeUndefined()
    expect(tweet.entities?.urls[0]?.expanded_url).toBe(
      'https://example.com/long',
    )
    expect(tweet.entities?.media?.[0]?.indices).toEqual([length, length])
    expect(tweet.mediaDetails?.[0]?.indices).toEqual([length, length])
    expect(tweet.photos).toEqual([
      {
        backgroundColor: { red: 0, green: 0, blue: 0 },
        cropCandidates: [],
        expandedUrl: 'https://x.com/ada/status/2000000000000000001/photo/1',
        url: 'https://pbs.twimg.com/media/long1.jpg',
        width: 1500,
        height: 1000,
      },
    ])
  })

  it('reads edit_control_initial for an edited post', () => {
    const edited = findTweet(tweetDetail, '2000000000000000001')
    const latest = toTweet(edited)!.tweet
    expect(latest.edit_control.edit_tweet_ids).toEqual([
      '2000000000000000000',
      '2000000000000000001',
    ])
    expect(latest.isEdited).toBe(true)
    expect(latest.isStaleEdit).toBe(false)

    const stale = toTweet({ ...edited, rest_id: '2000000000000000000' })!.tweet
    expect(stale.isStaleEdit).toBe(true)
  })

  it('maps reply fields', () => {
    const tweet = toTweet(findTweet(tweetDetail, '2000000000000000002'))!.tweet
    expect(tweet.in_reply_to_screen_name).toBe('ada')
    expect(tweet.in_reply_to_status_id_str).toBe('2000000000000000001')
    expect(tweet.in_reply_to_user_id_str).toBe('11')
    expect(tweet.entities?.user_mentions[0]).toEqual({
      id_str: '11',
      indices: [0, 4],
      name: 'Ada Example',
      screen_name: 'ada',
    })
  })

  it('returns undefined when the author is unavailable', () => {
    expect(
      toTweet(findTweet(tweetDetail, '2000000000000000004')),
    ).toBeUndefined()
  })

  it('produces output that passes TweetSchema without fallbacks', () => {
    for (const result of extractTweetResults(homeTimeline)) {
      const capture = toTweet(result)
      if (!capture) continue
      const validated = TweetSchema['~standard'].validate(capture.tweet)
      if (validated instanceof Promise) throw new Error('sync schema expected')
      if (validated.issues) throw new Error('unexpected schema issues')
      expect(validated.value).toEqual(capture.tweet)
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
