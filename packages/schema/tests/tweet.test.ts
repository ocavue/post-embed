import type { StandardSchemaV1 } from '@standard-schema/spec'
import { describe, expect, test } from 'vitest'

import {
  enrichedTweetSchema,
  enrichedTweetWithRepairsSchema,
  tweetSchema,
  tweetWithRepairsSchema,
} from '../src/index.js'

import { enriched, mediaBase, raw } from './fixtures.js'

async function output<Data>(
  schema: StandardSchemaV1<unknown, Data>,
  input: unknown,
) {
  const result = await schema['~standard'].validate(input)
  if (result.issues) throw new Error(JSON.stringify(result.issues))
  return result.value
}

function freeze(input: unknown) {
  if (input !== null && typeof input === 'object') {
    Object.freeze(input)
    for (const value of Object.values(input)) freeze(value)
  }
}

const photo = { ...mediaBase, type: 'photo', ext_alt_text: 'Image' }
const video = {
  ...mediaBase,
  type: 'video',
  video_info: {
    aspect_ratio: [1, 1],
    variants: [
      {
        content_type: 'video/mp4',
        url: 'https://example.com/video.mp4',
        bitrate: 100,
      },
    ],
  },
}

// Regression: https://github.com/vercel/react-tweet/commit/074901d9ab517fcaefdf4feb2e38248cf950ab68
// Regression: https://github.com/vercel/react-tweet/commit/ec744f4ab2e7f8b1068f31068e6125ecc927b431
// Synthetic inputs reproducing missing entities, empty arrays, and empty responses.
describe('raw response repair', () => {
  test.each([undefined, null, {}])(
    'normalizes missing entities: %j',
    async (entities) => {
      const result = await output(tweetWithRepairsSchema, { ...raw, entities })
      expect(result.data.entities).toEqual({
        hashtags: [],
        urls: [],
        symbols: [],
        user_mentions: [],
        media: [],
      })
      expect(result.repairs.length).toBeGreaterThan(0)
    },
  )
  test.each(['hashtags', 'urls', 'symbols', 'user_mentions', 'media'])(
    'defaults entities.%s without touching the text',
    async (key) => {
      const result = await output(tweetWithRepairsSchema, {
        ...raw,
        entities: { ...raw.entities, [key]: undefined },
      })
      expect(result.data.text).toBe(raw.text)
      expect(result.repairs).toContainEqual({
        path: ['entities', key],
        code: 'defaulted-missing',
      })
    },
  )
  test('keeps empty arrays and does not invent entity contents', async () => {
    const result = await output(tweetWithRepairsSchema, raw)
    expect(result.data).toEqual(raw)
    expect(result.repairs).toEqual([])
  })
  test.each([
    {},
    null,
    [],
    'response',
    { __typename: 'TweetTombstone' },
    { ...raw, __typename: 'TweetTombstone' },
  ])('rejects unavailable/non-tweet response %j', async (input) => {
    const result = await tweetSchema['~standard'].validate(input)
    expect(result.issues).toBeDefined()
    expect(result).not.toHaveProperty('value')
  })
  test.each([
    ['id_str', undefined],
    ['id_str', 123],
    ['id_str', 'abc'],
    ['id_str', ''],
    ['text', undefined],
    ['user', undefined],
    ['created_at', undefined],
    ['created_at', 'yesterday'],
    ['created_at', '2026-02-30T00:00:00Z'],
    ['created_at', '2026-02-29T00:00:00Z'],
    ['favorite_count', '1'],
    ['favorite_count', -1],
    ['favorite_count', Infinity],
    ['favorite_count', NaN],
    ['favorite_count', 1.5],
    ['isEdited', 'false'],
    ['lang', false],
    ['news_action_type', 'new-kind'],
    ['entities', 'bad'],
    ['mediaDetails', {}],
    ['photos', 'bad'],
    ['display_text_range', [0, 100]],
    ['display_text_range', [3, 1]],
    ['display_text_range', [0, 1, 2]],
    ['display_text_range', [0.1, 1]],
  ])('rejects invalid required field %s=%j', async (key, value) => {
    expect(
      (await tweetSchema['~standard'].validate({ ...raw, [key]: value }))
        .issues,
    ).toBeDefined()
  })
  test.each(['name', 'id_str', 'screen_name', 'profile_image_url_https'])(
    'does not fabricate user.%s',
    async (key) => {
      expect(
        (
          await tweetSchema['~standard'].validate({
            ...raw,
            user: { ...raw.user, [key]: undefined },
          })
        ).issues,
      ).toBeDefined()
    },
  )
  test('repairs default metadata and reports every default', async () => {
    const result = await output(tweetWithRepairsSchema, {
      ...raw,
      __typename: undefined,
      news_action_type: undefined,
      favorite_count: undefined,
      conversation_count: undefined,
      lang: undefined,
      isEdited: undefined,
      isStaleEdit: undefined,
      edit_control: undefined,
      user: {
        ...raw.user,
        verified: undefined,
        is_blue_verified: undefined,
        profile_image_shape: 'Octagon',
      },
    })
    expect(result.data).toMatchObject({
      __typename: 'Tweet',
      news_action_type: 'conversation',
      favorite_count: 0,
      conversation_count: 0,
      lang: 'und',
      isEdited: false,
      isStaleEdit: false,
      user: {
        verified: false,
        is_blue_verified: false,
        profile_image_shape: 'Circle',
      },
    })
    expect(result.data.edit_control).toEqual({
      edit_tweet_ids: [raw.id_str],
      editable_until_msecs: '0',
      is_edit_eligible: false,
      edits_remaining: '0',
    })
    expect(result.repairs).toContainEqual({
      path: ['user', 'profile_image_shape'],
      code: 'defaulted-invalid',
    })
    const second = await output(tweetWithRepairsSchema, result.data)
    expect(second).toEqual({ data: result.data, repairs: [] })
  })
  test('preserves valid false, zero, empty text, and a leap-day timestamp', async () => {
    const result = await output(tweetSchema, {
      ...raw,
      text: '',
      display_text_range: [0, 0],
      favorite_count: 0,
      created_at: '2024-02-29T00:00:00Z',
      user: { ...raw.user, verified: false },
    })
    expect(result).toMatchObject({
      text: '',
      favorite_count: 0,
      created_at: '2024-02-29T00:00:00Z',
      user: { verified: false },
    })
  })
  test('retains known label fields and removes bad optional labels', async () => {
    const label = {
      description: 'Company',
      badge: { url: 'https://example.com/badge' },
      url: { url: 'https://example.com', url_type: 'DeepLink' },
      user_label_type: 'BusinessLabel',
      user_label_display_type: 'Badge',
    }
    const result = await output(tweetSchema, {
      ...raw,
      user: {
        ...raw.user,
        profile_image_shape: 'Hexagon',
        verified_type: 'Government',
        highlighted_label: label,
      },
    })
    expect(result.user.highlighted_label).toEqual(label)
    const bad = await output(tweetWithRepairsSchema, {
      ...raw,
      user: {
        ...raw.user,
        verified_type: 'Other',
        highlighted_label: { badge: false },
      },
      note_tweet: { id: 5 },
      possibly_sensitive: 'no',
    })
    expect(bad.data.user).not.toHaveProperty('highlighted_label')
    expect(bad.data).not.toHaveProperty('note_tweet')
    expect(bad.repairs).toContainEqual({
      path: ['possibly_sensitive'],
      code: 'dropped-invalid-optional',
    })
  })
  test('preserves note IDs without inferring truncation from text length', async () => {
    expect(
      (await output(tweetSchema, { ...raw, note_tweet: { id: 'note' } }))
        .note_tweet,
    ).toEqual({ id: 'note' })
  })
  test('does not coerce a malformed edit control or rewrite an empty edit list', async () => {
    expect(
      (
        await tweetSchema['~standard'].validate({
          ...raw,
          edit_control: { ...raw.edit_control, edits_remaining: 1 },
        })
      ).issues,
    ).toBeDefined()
    expect(
      (
        await output(tweetSchema, {
          ...raw,
          edit_control: { ...raw.edit_control, edit_tweet_ids: [] },
        })
      ).edit_control.edit_tweet_ids,
    ).toEqual([])
  })
})

describe('ranges and enriched text', () => {
  test('derives display range from code points', async () => {
    const result = await output(tweetSchema, {
      ...raw,
      text: '😀中文',
      display_text_range: undefined,
    })
    expect(result.display_text_range).toEqual([0, 3])
  })
  test('drops only invalid raw entities, including invalid ranges', async () => {
    const good = { text: 'Hi', indices: [0, 2] }
    const result = await output(tweetWithRepairsSchema, {
      ...raw,
      display_text_range: [0, 1],
      entities: {
        ...raw.entities,
        hashtags: [
          good,
          { text: 'bad', indices: [0, 5] },
          { text: 1, indices: [0, 1] },
        ],
      },
    })
    expect(result.data.entities?.hashtags).toEqual([good])
    expect(result.repairs).toContainEqual({
      path: ['entities', 'hashtags', 1],
      code: 'dropped-invalid-item',
    })
  })
  test.each([
    undefined,
    null,
    {},
    [{ type: 'url', href: false }],
    [{ type: 'text', text: 'bad', indices: [0, 99] }],
  ])('enriched entities fallback preserves body: %j', async (entities) => {
    const result = await output(enrichedTweetWithRepairsSchema, {
      ...enriched,
      entities,
    })
    expect(result.data.entities).toEqual([
      { type: 'text', text: 'Hi 😀', indices: [0, 4] },
    ])
    expect(result.repairs).toContainEqual({
      path: ['entities'],
      code: 'derived',
    })
  })
  test('preserves legitimate empty enriched entities', async () => {
    expect(
      (await output(enrichedTweetSchema, { ...enriched, entities: [] }))
        .entities,
    ).toEqual([])
  })
  test('uses an empty fallback for an empty display range', async () => {
    expect(
      (
        await output(enrichedTweetSchema, {
          ...enriched,
          display_text_range: [0, 0],
          entities: null,
        })
      ).entities,
    ).toEqual([])
  })
  test('accepts all six enriched entity kinds without comparing displayed URL lengths', async () => {
    const entities = [
      { type: 'text', text: 'Hi 😀', indices: [0, 4] },
      {
        type: 'hashtag',
        text: '#Hi',
        indices: [0, 2],
        href: 'https://x.com/hashtag/Hi',
      },
      {
        type: 'symbol',
        text: '$Hi',
        indices: [0, 2],
        href: 'https://x.com/search',
      },
      {
        type: 'mention',
        text: '@Hi',
        indices: [0, 2],
        href: 'https://x.com/Hi',
        name: 'Hi',
        screen_name: 'Hi',
        id_str: '2',
      },
      ...['url', 'media'].map((type) => ({
        type,
        text: 'a much longer display URL',
        indices: [0, 2],
        href: 'https://example.com',
        display_url: 'example.com',
        expanded_url: 'https://example.com',
        url: 'https://t.co/hi',
      })),
    ]
    expect(
      (await output(enrichedTweetSchema, { ...enriched, entities })).entities,
    ).toEqual(entities)
  })
  test('derives absent action URLs while preserving valid provided URLs', async () => {
    const result = await output(enrichedTweetSchema, {
      ...enriched,
      url: 'https://twitter.com/example/status/123',
      like_url: null,
      reply_url: 5,
      user: { ...enriched.user, url: undefined, follow_url: undefined },
      in_reply_to_screen_name: 'other',
      in_reply_to_status_id_str: '2',
    })
    expect(result.url).toBe('https://twitter.com/example/status/123')
    expect(result.user.follow_url).toBe(
      'https://x.com/intent/follow?screen_name=example',
    )
    expect(result.like_url).toBe(
      `https://x.com/intent/like?tweet_id=${raw.id_str}`,
    )
    expect(result.in_reply_to_url).toBe('https://x.com/other/status/2')
    const incomplete = await output(enrichedTweetSchema, {
      ...enriched,
      in_reply_to_screen_name: 'other',
    })
    expect(incomplete).not.toHaveProperty('in_reply_to_url')
  })
})

describe('media and nested tweets', () => {
  test('keeps valid media beside a malformed photo and unknown media kind', async () => {
    const result = await output(tweetWithRepairsSchema, {
      ...raw,
      mediaDetails: [photo, { type: 'photo' }, { type: 'future' }],
    })
    expect(result.data.mediaDetails).toEqual([photo])
    expect(result.repairs).toEqual([
      { path: ['mediaDetails', 1], code: 'dropped-invalid-item' },
      { path: ['mediaDetails', 2], code: 'dropped-invalid-item' },
    ])
  })
  test('repairs nested media arrays and derives a missing ratio from actual dimensions', async () => {
    const result = await output(tweetWithRepairsSchema, {
      ...raw,
      mediaDetails: [
        {
          ...video,
          original_info: { width: 200, height: 100 },
          ext_media_color: undefined,
          video_info: {},
        },
      ],
    })
    expect(result.data.mediaDetails).toMatchObject([
      {
        original_info: { width: 200, height: 100, focus_rects: [] },
        ext_media_color: { palette: [] },
        video_info: { aspect_ratio: [200, 100], variants: [] },
      },
    ])
    expect(result.repairs).toContainEqual({
      path: ['mediaDetails', 0, 'video_info', 'aspect_ratio'],
      code: 'derived',
    })
  })
  test('preserves HLS, animated GIF, and valid variants beside invalid variants', async () => {
    const variant = {
      content_type: 'application/x-mpegURL',
      url: 'https://example.com/video.m3u8',
    }
    const result = await output(tweetWithRepairsSchema, {
      ...raw,
      mediaDetails: [
        {
          ...video,
          type: 'animated_gif',
          video_info: {
            aspect_ratio: [1, 1],
            variants: [variant, { content_type: 'future', url: 'x' }],
          },
        },
      ],
    })
    expect(result.data.mediaDetails).toMatchObject([
      { type: 'animated_gif', video_info: { variants: [variant] } },
    ])
    expect(result.repairs).toContainEqual({
      path: ['mediaDetails', 0, 'video_info', 'variants', 1],
      code: 'dropped-invalid-item',
    })
  })
  test('removes an invalid optional bitrate without dropping the playable variant', async () => {
    const result = await output(tweetSchema, {
      ...raw,
      mediaDetails: [
        {
          ...video,
          video_info: {
            aspect_ratio: [1, 1],
            variants: [
              {
                content_type: 'video/mp4',
                url: 'https://example.com/v',
                bitrate: -1,
              },
            ],
          },
        },
      ],
    })
    expect(result.mediaDetails).toMatchObject([
      {
        video_info: {
          variants: [
            { content_type: 'video/mp4', url: 'https://example.com/v' },
          ],
        },
      },
    ])
  })
  test.each([
    { ...photo, original_info: undefined },
    { ...photo, original_info: { width: Infinity, height: 100 } },
    { ...photo, sizes: undefined },
    { ...photo, ext_media_availability: undefined },
    { ...photo, media_url_https: undefined },
    { ...video, video_info: { aspect_ratio: [0, 1], variants: [] } },
    { ...video, video_info: { aspect_ratio: [1, 1], variants: 'wrong' } },
  ])('does not invent required media metadata', async (media) => {
    const result = await output(tweetWithRepairsSchema, {
      ...raw,
      mediaDetails: [media],
    })
    expect(result.data.mediaDetails).toEqual([])
    expect(result.repairs).toEqual([
      { path: ['mediaDetails', 0], code: 'dropped-invalid-item' },
    ])
  })
  test('keeps valid palette entries and permits negative crop positions', async () => {
    const palette = { percentage: 0.5, rgb: { red: 255, green: 0, blue: 128 } }
    const rectangle = { x: -10, y: -20, w: 30, h: 40 }
    const result = await output(tweetSchema, {
      ...raw,
      mediaDetails: [
        {
          ...photo,
          original_info: {
            width: 100,
            height: 100,
            focus_rects: [rectangle, { x: 0 }],
          },
          ext_media_color: { palette: [palette, { percentage: 0.1 }] },
        },
      ],
    })
    expect(result.mediaDetails).toMatchObject([
      {
        original_info: { focus_rects: [rectangle] },
        ext_media_color: { palette: [palette] },
      },
    ])
  })
  test('validates and repairs both legacy media representations', async () => {
    const legacyPhoto = {
      backgroundColor: { red: 1, green: 2, blue: 3 },
      cropCandidates: undefined,
      expandedUrl: 'https://example.com',
      url: 'https://example.com/image',
      width: 100,
      height: 100,
    }
    const legacyVideo = {
      aspectRatio: [1, 1],
      contentType: 'video/mp4',
      durationMs: 100,
      mediaAvailability: { status: 'Available' },
      poster: 'https://example.com/poster',
      variants: undefined,
      videoId: { type: 'tweet', id: '1' },
      viewCount: 0,
    }
    const result = await output(tweetSchema, {
      ...raw,
      photos: [legacyPhoto],
      video: legacyVideo,
    })
    expect(result.photos).toMatchObject([{ cropCandidates: [] }])
    expect(result.video?.variants).toEqual([])
    const bad = await output(tweetWithRepairsSchema, {
      ...raw,
      video: { ...legacyVideo, aspectRatio: undefined },
    })
    expect(bad.data).not.toHaveProperty('video')
    expect(bad.repairs).toContainEqual({
      path: ['video'],
      code: 'dropped-invalid-optional',
    })
  })
  test('quote and parent have independent ranges, counts, and identity', async () => {
    const quote = raw.quoted_tweet
    expect(quote).toBeDefined()
    const result = await output(tweetWithRepairsSchema, {
      ...raw,
      quoted_tweet: {
        ...quote,
        text: '中😀',
        display_text_range: null,
        entities: undefined,
        reply_count: undefined,
        retweet_count: undefined,
      },
      parent: {
        ...quote,
        self_thread: undefined,
        mediaDetails: undefined,
        reply_count: undefined,
      },
    })
    expect(result.data.quoted_tweet).toMatchObject({
      id_str: '2',
      text: '中😀',
      display_text_range: [0, 2],
      reply_count: 0,
      retweet_count: 0,
    })
    expect(result.data.parent?.reply_count).toBe(0)
    const invalid = await output(tweetWithRepairsSchema, {
      ...raw,
      quoted_tweet: { ...quote, self_thread: undefined },
      parent: { ...quote, display_text_range: [0, 999] },
    })
    expect(invalid.data).not.toHaveProperty('quoted_tweet')
    expect(invalid.data).not.toHaveProperty('parent')
    expect(invalid.data.text).toBe(raw.text)
  })
  test('enriched quote derives its own URL and fallback text without main tweet actions', async () => {
    const result = await output(enrichedTweetSchema, {
      ...enriched,
      quoted_tweet: {
        ...enriched.quoted_tweet,
        text: '中😀',
        display_text_range: undefined,
        entities: undefined,
        url: undefined,
      },
    })
    expect(result.quoted_tweet).toMatchObject({
      url: 'https://x.com/example/status/2',
      entities: [{ type: 'text', text: '中😀', indices: [0, 2] }],
    })
    expect(result.quoted_tweet).not.toHaveProperty('like_url')
    expect(result.quoted_tweet?.user).not.toHaveProperty('follow_url')
  })
})

describe('Standard Schema and immutable outputs', () => {
  test('uses the standard surface and identical data in both report modes', async () => {
    for (const schema of [
      tweetSchema,
      enrichedTweetSchema,
      tweetWithRepairsSchema,
      enrichedTweetWithRepairsSchema,
    ]) {
      expect(Object.keys(schema)).toEqual(['~standard'])
      expect(schema['~standard'].version).toBe(1)
      expect(schema['~standard'].vendor).toBe('post-embed')
    }
    const input = { ...raw, entities: undefined }
    const plain = await output(tweetSchema, input)
    const report = await output(tweetWithRepairsSchema, input)
    expect(report.data).toEqual(plain)
    expect(await output(enrichedTweetSchema, enriched)).toEqual(
      (await output(enrichedTweetWithRepairsSchema, enriched)).data,
    )
  })
  test('publishes only standard issues, never raw inputs or partial output', async () => {
    const input = { ...raw, user: { ...raw.user, name: 5 } }
    const result = await tweetSchema['~standard'].validate(input)
    expect(result.issues).toBeDefined()
    expect(result.issues).toContainEqual({
      message: 'Expected string',
      path: ['user', 'name'],
    })
    for (const issue of result.issues ?? [])
      expect(Object.keys(issue).sort()).toEqual(['message', 'path'])
    expect(result).not.toHaveProperty('value')
    expect(await tweetWithRepairsSchema['~standard'].validate(input)).toEqual(
      result,
    )
  })
  test('does not include rejected strings in validation messages', async () => {
    const result = await tweetSchema['~standard'].validate({
      ...raw,
      created_at: 'private input text',
    })
    expect(result.issues).toBeDefined()
    expect(JSON.stringify(result.issues)).not.toContain('private input text')
  })
  test('locates an out-of-bounds display range', async () => {
    const result = await tweetSchema['~standard'].validate({
      ...raw,
      display_text_range: [0, 99],
    })
    expect(result.issues).toContainEqual({
      message: 'Range exceeds text length',
      path: ['display_text_range'],
    })
  })
  test('reports unknown keys with original array indices and strips them', async () => {
    const input = {
      ...raw,
      future: undefined,
      user: { ...raw.user, future: true },
      mediaDetails: [
        { type: 'future' },
        {
          ...photo,
          future: true,
          original_info: { ...photo.original_info, future: true },
        },
      ],
    }
    const result = await output(tweetWithRepairsSchema, input)
    expect(result.data).not.toHaveProperty('future')
    expect(result.data.user).not.toHaveProperty('future')
    expect(result.repairs).toContainEqual({
      path: ['future'],
      code: 'discarded-unknown-key',
    })
    expect(result.repairs).toContainEqual({
      path: ['mediaDetails', 1, 'future'],
      code: 'discarded-unknown-key',
    })
    expect(result.repairs).toContainEqual({
      path: ['mediaDetails', 1, 'original_info', 'future'],
      code: 'discarded-unknown-key',
    })
    expect((await output(tweetWithRepairsSchema, result.data)).repairs).toEqual(
      [],
    )
  })
  test('accepts frozen data without sharing mutable objects or arrays', async () => {
    const input = structuredClone(raw)
    freeze(input)
    const first = await output(tweetWithRepairsSchema, input)
    const second = await output(tweetWithRepairsSchema, input)
    expect(input).toEqual(raw)
    expect(first.data.user).not.toBe(input.user)
    expect(first.data.mediaDetails?.[0]).not.toBe(input.mediaDetails?.[0])
    expect(first.data.entities?.hashtags).not.toBe(
      second.data.entities?.hashtags,
    )
    expect(first.repairs).not.toBe(second.repairs)
  })
  test('creates fresh defaults and keeps concurrent reports isolated', async () => {
    const [first, second] = await Promise.all([
      output(tweetWithRepairsSchema, {
        ...raw,
        entities: undefined,
        mediaDetails: null,
      }),
      output(tweetWithRepairsSchema, raw),
    ])
    expect(first.repairs).toContainEqual({
      path: ['mediaDetails'],
      code: 'defaulted-null',
    })
    expect(second.repairs).toEqual([])
    expect(first.data.entities).not.toBe(second.data.entities)
  })
})
