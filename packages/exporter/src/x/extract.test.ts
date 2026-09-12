import { describe, expect, it } from 'vitest'

import { extractTweetResults } from './extract.ts'
import homeTimeline from './testing/fixtures/HomeTimeline.json' with { type: 'json' }
import tweetDetail from './testing/fixtures/TweetDetail.json' with { type: 'json' }

describe('extractTweetResults', () => {
  it('finds timeline tweets, quoted tweets and retweet originals', () => {
    const ids = extractTweetResults(homeTimeline).map((tweet) => tweet.rest_id)
    expect(ids).toEqual([
      '1000000000000000001',
      '1000000000000000002',
      '1000000000000000003',
      '1000000000000000004',
      '1000000000000000005',
    ])
  })

  it('finds the post, its replies and lazily added module items', () => {
    const ids = extractTweetResults(tweetDetail).map((tweet) => tweet.rest_id)
    expect(ids).toEqual([
      '2000000000000000001',
      '2000000000000000002',
      '2000000000000000004',
    ])
  })

  it('unwraps visibility results and skips tombstones', () => {
    const tweets = extractTweetResults(tweetDetail)
    const reply = tweets.find(
      (tweet) => tweet.rest_id === '2000000000000000002',
    )
    expect(reply?.__typename).toBe('Tweet')
    expect(reply?.legacy.in_reply_to_status_id_str).toBe('2000000000000000001')
    expect(
      tweets.some((tweet) => tweet.rest_id === '2000000000000000003'),
    ).toBe(false)
  })

  it('deduplicates by rest_id', () => {
    const tweet = extractTweetResults(homeTimeline)[0]
    expect(extractTweetResults([tweet, { nested: tweet }])).toHaveLength(1)
  })

  it('returns nothing for scalars and empty containers', () => {
    expect(extractTweetResults(null)).toEqual([])
    expect(extractTweetResults('tweet')).toEqual([])
    expect(extractTweetResults({})).toEqual([])
    expect(extractTweetResults([])).toEqual([])
  })

  it('terminates on cyclic input', () => {
    const cyclic: Record<string, unknown> = {}
    cyclic['self'] = cyclic
    expect(extractTweetResults(cyclic)).toEqual([])
  })
})
