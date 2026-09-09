import type { StandardSchemaV1 } from '@standard-schema/spec'
import { describe, expect, test } from 'vitest'

import { enrichedTweetSchema, tweetSchema } from '../index.js'

import { enriched, raw } from './fixtures.js'

async function parse<Output>(
  schema: StandardSchemaV1<unknown, Output>,
  input: unknown,
) {
  const result = await schema['~standard'].validate(input)
  expect(result.issues).toBeUndefined()
  if (result.issues) throw new Error('Expected successful validation')
  return result.value
}

function freeze(input: unknown) {
  if (input && typeof input === 'object') {
    Object.freeze(input)
    for (const value of Object.values(input)) freeze(value)
  }
}

describe('type defaults', () => {
  test.each([{}, undefined, null, false, 42, 'tweet', []])(
    'defaults a root input: %j',
    async (input) => {
      const tweet = await parse(tweetSchema, input)
      expect(tweet).toEqual({
        __typename: 'Tweet',
        lang: '',
        created_at: '',
        display_text_range: [0, 0],
        id_str: '',
        text: '',
        user: {
          id_str: '',
          name: '',
          screen_name: '',
          profile_image_url_https: '',
          profile_image_shape: 'Circle',
          verified: false,
          is_blue_verified: false,
        },
        edit_control: {
          edit_tweet_ids: [],
          editable_until_msecs: '',
          is_edit_eligible: false,
          edits_remaining: '',
        },
        isEdited: false,
        isStaleEdit: false,
        favorite_count: 0,
        conversation_count: 0,
        news_action_type: 'conversation',
      })
      const normalized = await parse(enrichedTweetSchema, input)
      expect(normalized).toEqual({
        ...tweet,
        entities: [],
        url: '',
        like_url: '',
        reply_url: '',
        user: { ...tweet.user, url: '', follow_url: '' },
      })
    },
  )

  test.each([undefined, null, 1, false, {}, []])(
    'defaults invalid strings: %j',
    async (value) => {
      const tweet = await parse(tweetSchema, {
        id_str: value,
        text: value,
        created_at: value,
        lang: value,
      })
      expect([tweet.id_str, tweet.text, tweet.created_at, tweet.lang]).toEqual([
        '',
        '',
        '',
        '',
      ])
    },
  )

  test.each([undefined, null, '123', false, {}, [], NaN, Infinity, -Infinity])(
    'defaults invalid numbers: %j',
    async (value) => {
      expect(
        (await parse(tweetSchema, { favorite_count: value })).favorite_count,
      ).toBe(0)
    },
  )

  test.each([undefined, null, 'true', 1, {}, []])(
    'defaults invalid booleans: %j',
    async (value) => {
      expect((await parse(tweetSchema, { isEdited: value })).isEdited).toBe(
        false,
      )
    },
  )

  test('preserves type-valid values without extra business constraints', async () => {
    const tweet = await parse(tweetSchema, {
      id_str: 'not-a-decimal-id',
      text: '  😀  ',
      created_at: 'not-a-date',
      lang: '',
      favorite_count: -1.5,
      conversation_count: 0,
      isEdited: true,
      isStaleEdit: false,
      display_text_range: [100, -20],
      user: { profile_image_shape: 'Hexagon' },
    })
    expect(tweet).toMatchObject({
      id_str: 'not-a-decimal-id',
      text: '  😀  ',
      created_at: 'not-a-date',
      lang: '',
      favorite_count: -1.5,
      conversation_count: 0,
      isEdited: true,
      isStaleEdit: false,
      display_text_range: [100, -20],
      user: { profile_image_shape: 'Hexagon' },
    })
  })

  test('defaults literals and enums without adding new members', async () => {
    const tweet = await parse(tweetSchema, {
      __typename: 'TweetTombstone',
      news_action_type: null,
      user: {
        profile_image_shape: 'Triangle',
        verified_type: 'Other',
        highlighted_label: {},
      },
    })
    expect(tweet.__typename).toBe('Tweet')
    expect(tweet.news_action_type).toBe('conversation')
    expect(tweet.user).toMatchObject({
      profile_image_shape: 'Circle',
      verified_type: undefined,
      highlighted_label: {
        user_label_type: 'BusinessLabel',
        user_label_display_type: 'Badge',
      },
    })
  })

  test.each(['Business', 'Government'])(
    'preserves verified type %s',
    async (verified_type) => {
      expect(
        (await parse(tweetSchema, { user: { verified_type } })).user
          .verified_type,
      ).toBe(verified_type)
    },
  )

  test.each([undefined, null, [], [1], [1, 2, 3], 'pair'])(
    'defaults invalid tuple length or container: %j',
    async (value) => {
      expect(
        (await parse(tweetSchema, { display_text_range: value }))
          .display_text_range,
      ).toEqual([0, 0])
    },
  )

  test('defaults tuple elements independently', async () => {
    expect(
      (await parse(tweetSchema, { display_text_range: [false, 12] }))
        .display_text_range,
    ).toEqual([0, 12])
  })
})

describe('collections and optional fields', () => {
  test.each([{}, { entities: undefined }])(
    'preserves absent optional fields: %j',
    async (input) => {
      const tweet = await parse(tweetSchema, input)
      expect(tweet.entities).toBeUndefined()
      expect(tweet.photos).toBeUndefined()
      expect(tweet.parent).toBeUndefined()
      expect(tweet.quoted_tweet).toBeUndefined()
      expect(tweet.video).toBeUndefined()
    },
  )

  test.each([{}, null, false, 'entities'])(
    'fills a supplied raw entities object: %j',
    async (entities) => {
      expect((await parse(tweetSchema, { entities })).entities).toEqual({
        hashtags: [],
        urls: [],
        user_mentions: [],
        symbols: [],
      })
    },
  )

  test.each([undefined, null, {}, 'array', []])(
    'defaults required arrays: %j',
    async (value) => {
      const tweet = await parse(tweetSchema, {
        entities: {
          hashtags: value,
          urls: value,
          user_mentions: value,
          symbols: value,
        },
        edit_control: { edit_tweet_ids: value },
      })
      expect(tweet.entities).toEqual({
        hashtags: [],
        urls: [],
        user_mentions: [],
        symbols: [],
      })
      expect(tweet.edit_control.edit_tweet_ids).toEqual([])
      const normalized = await parse(enrichedTweetSchema, {
        entities: value,
        url: null,
      })
      expect(normalized.entities).toEqual([])
      expect(normalized.url).toBe('')
    },
  )

  test('defaults invalid supplied optional fields', async () => {
    const tweet = await parse(tweetSchema, {
      photos: null,
      mediaDetails: false,
      possibly_sensitive: 'true',
      in_reply_to_status_id_str: 123,
      parent: null,
      quoted_tweet: {},
      video: null,
      note_tweet: null,
    })
    expect(tweet).toMatchObject({
      photos: [],
      mediaDetails: [],
      possibly_sensitive: false,
      in_reply_to_status_id_str: '',
      parent: { text: '', reply_count: 0 },
      quoted_tweet: { text: '', self_thread: { id_str: '' } },
      video: {
        variants: [],
        aspectRatio: [0, 0],
        videoId: { id: '', type: '' },
      },
      note_tweet: { id: '' },
    })
  })

  test('keeps items with defaultable fields and does not derive content', async () => {
    const tweet = await parse(tweetSchema, {
      photos: [{ url: 'first' }, { url: null }],
      entities: { hashtags: [{ text: 'tag' }, null] },
      edit_control: { edit_tweet_ids: ['123', 456] },
    })
    expect(tweet.photos?.map((photo) => photo.url)).toEqual(['first', ''])
    expect(tweet.entities?.hashtags).toEqual([
      { text: 'tag', indices: [0, 0] },
      { text: '', indices: [0, 0] },
    ])
    expect(tweet.edit_control.edit_tweet_ids).toEqual(['123', ''])
    const normalized = await parse(enrichedTweetSchema, {
      text: 'Keep raw text',
      quoted_tweet: null,
    })
    expect(normalized.text).toBe('Keep raw text')
    expect(normalized.entities).toEqual([])
    expect(normalized.quoted_tweet).toMatchObject({
      entities: [],
      url: '',
      user: { name: '' },
    })
  })
})

describe('union selection', () => {
  test.each(['photo', 'video', 'animated_gif'])(
    'retains media type %s and fills nested metadata',
    async (type) => {
      const tweet = await parse(tweetSchema, {
        mediaDetails: [{ type, media_url_https: 'existing' }],
      })
      expect(tweet.mediaDetails).toHaveLength(1)
      expect(tweet.mediaDetails?.[0]).toMatchObject({
        type,
        media_url_https: 'existing',
        original_info: { height: 0, width: 0, focus_rects: [] },
        ext_media_color: { palette: [] },
        sizes: { large: { w: 0, h: 0, resize: '' } },
      })
      if (type !== 'photo')
        expect(tweet.mediaDetails?.[0]).toHaveProperty('video_info', {
          aspect_ratio: [0, 0],
          variants: [],
        })
    },
  )

  test.each(['text', 'hashtag', 'mention', 'url', 'media', 'symbol'])(
    'retains enriched entity type %s',
    async (type) => {
      const tweet = await parse(enrichedTweetSchema, {
        entities: [{ type, text: 'existing', href: 'link' }],
      })
      expect(tweet.entities).toHaveLength(1)
      expect(tweet.entities[0]).toMatchObject({
        type,
        text: 'existing',
        indices: [0, 0],
      })
      if (type !== 'text')
        expect(tweet.entities[0]).toHaveProperty('href', 'link')
    },
  )

  test.each([{}, null, { type: 'unknown' }])(
    'defaults the whole array for an unrecognized branch: %j',
    async (invalid) => {
      const tweet = await parse(tweetSchema, {
        mediaDetails: [{ type: 'photo' }, invalid],
      })
      expect(tweet.mediaDetails).toEqual([])
      const normalized = await parse(enrichedTweetSchema, {
        entities: [{ type: 'text', text: 'original' }, invalid],
      })
      expect(normalized.entities).toEqual([])
    },
  )

  test('preserves HLS and defaults unsupported video content types', async () => {
    const tweet = await parse(tweetSchema, {
      mediaDetails: [
        {
          type: 'video',
          video_info: {
            variants: [
              { content_type: 'application/x-mpegURL', url: 'hls' },
              { content_type: 'unknown' },
            ],
          },
        },
      ],
    })
    expect(tweet.mediaDetails?.[0]).toMatchObject({
      video_info: {
        variants: [
          { content_type: 'application/x-mpegURL', url: 'hls' },
          { content_type: 'video/mp4', url: '' },
        ],
      },
    })
  })
})

test('preserves valid fixtures and returns independent output without mutating input', async () => {
  freeze(raw)
  freeze(enriched)
  const tweet = await parse(tweetSchema, raw)
  const normalized = await parse(enrichedTweetSchema, enriched)
  expect(tweet).toEqual(raw)
  expect(normalized).toEqual(enriched)
  expect(tweet.user).not.toBe(raw.user)
  expect(tweet.mediaDetails?.[0]).not.toBe(raw.mediaDetails?.[0])
  expect(normalized.entities[0]).not.toBe(enriched.entities[0])
  expect(await parse(tweetSchema, tweet)).toEqual(tweet)
  expect(await parse(enrichedTweetSchema, normalized)).toEqual(normalized)
})

test('defaults are fresh across calls and parsing is idempotent', async () => {
  const first = await parse(enrichedTweetSchema, {})
  const second = await parse(enrichedTweetSchema, {})
  expect(await parse(enrichedTweetSchema, first)).toEqual(first)
  first.entities.push({ type: 'text', text: 'changed', indices: [0, 0] })
  first.edit_control.edit_tweet_ids.push('changed')
  first.display_text_range[0] = 1
  first.user.name = 'changed'
  expect(second.entities).toEqual([])
  expect(second.edit_control.edit_tweet_ids).toEqual([])
  expect(second.display_text_range).toEqual([0, 0])
  expect(second.user.name).toBe('')
})

test('strips unknown keys while preserving known nested values', async () => {
  const tweet = await parse(enrichedTweetSchema, {
    extra: true,
    user: { extra: true, name: 'author', url: 'profile' },
    entities: [
      { type: 'url', extra: true, text: 'link', url: 'target', href: 'href' },
    ],
  })
  expect(tweet).not.toHaveProperty('extra')
  expect(tweet.user).not.toHaveProperty('extra')
  expect(tweet.entities[0]).not.toHaveProperty('extra')
  expect(tweet.user).toMatchObject({ name: 'author', url: 'profile' })
  expect(tweet.entities[0]).toMatchObject({ url: 'target', href: 'href' })
})

test('exposes native Standard Schema results', async () => {
  for (const schema of [tweetSchema, enrichedTweetSchema]) {
    expect(schema['~standard'].version).toBe(1)
    expect(schema['~standard'].vendor).toBe('valibot')
    const result = await schema['~standard'].validate({})
    expect(result).toHaveProperty('value')
    expect(result.issues).toBeUndefined()
  }
})
