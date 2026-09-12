import { describe, expect, it } from 'vitest'

import { matchXOperation } from './operations.ts'

describe('matchXOperation', () => {
  it('matches the logged-in API path and ignores the query id', () => {
    expect(
      matchXOperation(
        'https://x.com/i/api/graphql/abc123/TweetDetail?variables=%7B%7D',
      ),
    ).toBe('TweetDetail')
    expect(
      matchXOperation('https://x.com/i/api/graphql/other/TweetDetail'),
    ).toBe('TweetDetail')
  })

  it('matches the logged-out api.x.com and twitter.com hosts', () => {
    expect(matchXOperation('https://api.x.com/graphql/abc/Bookmarks')).toBe(
      'Bookmarks',
    )
    expect(
      matchXOperation('https://twitter.com/i/api/graphql/abc/HomeTimeline'),
    ).toBe('HomeTimeline')
  })

  it('rejects operations outside the list', () => {
    expect(
      matchXOperation('https://api.x.com/graphql/abc/UserByScreenName'),
    ).toBeUndefined()
    expect(
      matchXOperation('https://x.com/i/api/graphql/abc/CreateBookmark'),
    ).toBeUndefined()
  })

  it('rejects other hosts and unparsable URLs', () => {
    expect(
      matchXOperation('https://example.com/graphql/abc/TweetDetail'),
    ).toBeUndefined()
    expect(
      matchXOperation('https://notx.com/i/api/graphql/abc/TweetDetail'),
    ).toBeUndefined()
    expect(matchXOperation('http://[')).toBeUndefined()
  })

  it('accepts a custom operation list', () => {
    expect(
      matchXOperation('https://x.com/i/api/graphql/abc/CreateBookmark', [
        'CreateBookmark',
      ]),
    ).toBe('CreateBookmark')
    expect(
      matchXOperation('https://x.com/i/api/graphql/abc/TweetDetail', [
        'CreateBookmark',
      ]),
    ).toBeUndefined()
  })
})
