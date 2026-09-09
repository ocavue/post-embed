import { readFileSync, readdirSync } from 'node:fs'

import type { StandardSchemaV1 } from '@standard-schema/spec'
import * as ts from 'typescript'
import { describe, expect, test } from 'vitest'

import { enrichedTweetSchema, tweetSchema } from '../index.ts'

import { enriched, raw } from './fixtures.ts'

const minimal = { user: {}, edit_control: {} }
const mediaObjects = {
  ext_media_availability: {},
  ext_media_color: {},
  original_info: {},
  sizes: { large: {}, medium: {}, small: {}, thumb: {} },
}

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
    'rejects missing required objects: %j',
    async (input) => {
      for (const schema of [tweetSchema, enrichedTweetSchema]) {
        const result = await schema['~standard'].validate(input)
        expect(result.issues?.length).toBeGreaterThan(0)
      }
    },
  )

  test('defaults fields inside supplied required objects', async () => {
    const tweet = await parse(tweetSchema, minimal)
    expect(tweet.user).toEqual({
      id_str: '',
      name: '',
      screen_name: '',
      profile_image_url_https: '',
      profile_image_shape: 'Circle',
      verified: false,
      is_blue_verified: false,
    })
    expect(tweet.edit_control).toEqual({
      edit_tweet_ids: [],
      editable_until_msecs: '',
      is_edit_eligible: false,
      edits_remaining: '',
    })
    expect(tweet.text).toBe('')
    expect(tweet.favorite_count).toBe(0)
    const normalized = await parse(enrichedTweetSchema, minimal)
    expect(normalized.entities).toEqual([])
    expect(normalized.user).toEqual({ ...tweet.user, url: '', follow_url: '' })
  })

  test.each(['user', 'edit_control'])(
    'reports the invalid required object path: %s',
    async (key) => {
      for (const value of [undefined, null, false, 123, 'invalid']) {
        const result = await tweetSchema['~standard'].validate({
          ...minimal,
          [key]: value,
        })
        expect(
          result.issues?.some((issue) => {
            return issue.path?.some((segment) => {
              return typeof segment === 'object'
                ? segment.key === key
                : segment === key
            })
          }),
        ).toBe(true)
      }
    },
  )

  test.each([undefined, null, 1, false, {}, []])(
    'defaults invalid strings: %j',
    async (value) => {
      const tweet = await parse(tweetSchema, {
        ...minimal,
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
        (await parse(tweetSchema, { ...minimal, favorite_count: value }))
          .favorite_count,
      ).toBe(0)
    },
  )

  test.each([undefined, null, 'true', 1, {}, []])(
    'defaults invalid booleans: %j',
    async (value) => {
      expect(
        (await parse(tweetSchema, { ...minimal, isEdited: value })).isEdited,
      ).toBe(false)
    },
  )

  test('preserves type-valid values without extra business constraints', async () => {
    const tweet = await parse(tweetSchema, {
      ...minimal,
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
      ...minimal,
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
        (await parse(tweetSchema, { ...minimal, user: { verified_type } })).user
          .verified_type,
      ).toBe(verified_type)
    },
  )

  test.each([undefined, null, [], [1], [1, 2, 3], 'pair'])(
    'defaults invalid tuple length or container: %j',
    async (value) => {
      expect(
        (await parse(tweetSchema, { ...minimal, display_text_range: value }))
          .display_text_range,
      ).toEqual([0, 0])
    },
  )

  test('defaults tuple elements independently', async () => {
    expect(
      (
        await parse(tweetSchema, {
          ...minimal,
          display_text_range: [false, 12],
        })
      ).display_text_range,
    ).toEqual([0, 12])
  })
})

describe('collections and optional fields', () => {
  test.each([{}, { entities: undefined }])(
    'preserves absent optional fields: %j',
    async (input) => {
      const tweet = await parse(tweetSchema, { ...minimal, ...input })
      expect(tweet.entities).toBeUndefined()
      expect(tweet.photos).toBeUndefined()
      expect(tweet.parent).toBeUndefined()
      expect(tweet.quoted_tweet).toBeUndefined()
      expect(tweet.video).toBeUndefined()
    },
  )

  test.each([{}])(
    'fills a supplied raw entities object: %j',
    async (entities) => {
      expect(
        (await parse(tweetSchema, { ...minimal, entities })).entities,
      ).toEqual({
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
        ...minimal,
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
        ...minimal,
        entities: value,
        url: null,
      })
      expect(normalized.entities).toEqual([])
      expect(normalized.url).toBe('')
    },
  )

  test('defaults optional scalars and arrays', async () => {
    const tweet = await parse(tweetSchema, {
      ...minimal,
      photos: null,
      mediaDetails: false,
      possibly_sensitive: 'true',
      in_reply_to_status_id_str: 123,
    })
    expect(tweet).toMatchObject({
      photos: [],
      mediaDetails: [],
      possibly_sensitive: false,
      in_reply_to_status_id_str: '',
    })
  })

  test.each(['entities', 'parent', 'quoted_tweet', 'video', 'note_tweet'])(
    'rejects an invalid supplied optional object: %s',
    async (key) => {
      const result = await tweetSchema['~standard'].validate({
        ...minimal,
        [key]: null,
      })
      expect(result.issues?.length).toBeGreaterThan(0)
    },
  )

  test('requires nested objects in supplied parent, quote, and video', async () => {
    for (const key of ['parent', 'quoted_tweet', 'video']) {
      const result = await tweetSchema['~standard'].validate({
        ...minimal,
        [key]: {},
      })
      expect(result.issues?.length).toBeGreaterThan(0)
    }
  })

  test('keeps items with defaultable fields and does not derive content', async () => {
    const tweet = await parse(tweetSchema, {
      ...minimal,
      photos: [
        { backgroundColor: {}, url: 'first' },
        { backgroundColor: {}, url: null },
      ],
      entities: { hashtags: [{ text: 'tag' }, {}] },
      edit_control: { edit_tweet_ids: ['123', 456] },
    })
    expect(tweet.photos?.map((photo) => photo.url)).toEqual(['first', ''])
    expect(tweet.entities?.hashtags).toEqual([
      { text: 'tag', indices: [0, 0] },
      { text: '', indices: [0, 0] },
    ])
    expect(tweet.edit_control.edit_tweet_ids).toEqual(['123', ''])
    const normalized = await parse(enrichedTweetSchema, {
      ...minimal,
      text: 'Keep raw text',
      quoted_tweet: { ...minimal, self_thread: {} },
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
        ...minimal,
        mediaDetails: [
          {
            ...mediaObjects,
            type,
            media_url_https: 'existing',
            video_info: {},
          },
        ],
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
        ...minimal,
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
        ...minimal,
        mediaDetails: [{ ...mediaObjects, type: 'photo' }, invalid],
      })
      expect(tweet.mediaDetails).toEqual([])
      const normalized = await parse(enrichedTweetSchema, {
        ...minimal,
        entities: [{ type: 'text', text: 'original' }, invalid],
      })
      expect(normalized.entities).toEqual([])
    },
  )

  test('defaults a containing array when an item lacks a required object', async () => {
    const tweet = await parse(tweetSchema, {
      ...minimal,
      mediaDetails: [{ ...mediaObjects, type: 'photo' }, { type: 'photo' }],
      photos: [{ url: 'missing backgroundColor' }],
      entities: { hashtags: [null] },
    })
    expect(tweet.mediaDetails).toEqual([])
    expect(tweet.photos).toEqual([])
    expect(tweet.entities?.hashtags).toEqual([])
  })

  test('preserves HLS and defaults unsupported video content types', async () => {
    const tweet = await parse(tweetSchema, {
      ...minimal,
      mediaDetails: [
        {
          ...mediaObjects,
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
  const first = await parse(enrichedTweetSchema, { ...minimal })
  const second = await parse(enrichedTweetSchema, { ...minimal })
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
    ...minimal,
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
    const result = await schema['~standard'].validate(minimal)
    expect(result).toHaveProperty('value')
    expect(result.issues).toBeUndefined()
  }
})

test('schema definition files and names mirror the type declarations', () => {
  const typesRoot = new URL('../../../types/src/', import.meta.url)
  const schemasRoot = new URL('../', import.meta.url)
  function definitionFiles(root: URL) {
    return readdirSync(root, { recursive: true, encoding: 'utf8' })
      .filter((path) => {
        return (
          path.endsWith('.ts') &&
          !/\.test(?:-d)?\.ts$/.test(path) &&
          !path.endsWith('/fixtures.ts')
        )
      })
      .sort()
  }
  const files = definitionFiles(typesRoot)
  expect(definitionFiles(schemasRoot)).toEqual(files)
  for (const file of files) {
    expect(
      readFileSync(
        new URL(file.replace(/\.ts$/, '.test-d.ts'), schemasRoot),
        'utf8',
      ),
      file,
    ).toContain('expectTypeOf')
    const typesFile = ts.createSourceFile(
      file,
      readFileSync(new URL(file, typesRoot), 'utf8'),
      ts.ScriptTarget.Latest,
    )
    const declarations = typesFile.statements.filter((statement) => {
      return (
        ts.isTypeAliasDeclaration(statement) ||
        ts.isInterfaceDeclaration(statement)
      )
    })
    if (declarations.length === 0) continue
    const schemasFile = ts.createSourceFile(
      file,
      readFileSync(new URL(file, schemasRoot), 'utf8'),
      ts.ScriptTarget.Latest,
    )
    const actual = schemasFile.statements.flatMap((statement) => {
      if (!ts.isVariableStatement(statement)) return []
      return statement.declarationList.declarations.map((declaration) => ({
        name: declaration.name.getText(schemasFile),
        exported:
          statement.modifiers?.some(
            (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
          ) ?? false,
      }))
    })
    const expected = declarations.map((declaration) => ({
      name: `${declaration.name.text}Schema`,
      exported:
        declaration.modifiers?.some(
          (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
        ) ?? false,
    }))
    expect(
      actual.sort((left, right) => left.name.localeCompare(right.name)),
      file,
    ).toEqual(
      expected.sort((left, right) => left.name.localeCompare(right.name)),
    )
  }
})
