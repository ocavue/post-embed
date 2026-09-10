import type { Tweet } from '@post-embed/types'

import { addMediaSnapshot } from './media-snapshots.ts'

function createTweet(text = 'Hello 😀\nA saved post.'): Tweet {
  return {
    __typename: 'Tweet',
    lang: 'en',
    created_at: '2026-09-10T00:00:00.000Z',
    id_str: '1234567890123456789',
    text,
    display_text_range: [0, Array.from(text).length],
    user: {
      id_str: '42',
      name: 'Example Author',
      screen_name: 'example',
      profile_image_url_https: 'https://example.com/avatar.jpg',
      profile_image_shape: 'Circle',
      verified: false,
      is_blue_verified: false,
    },
    edit_control: {
      edit_tweet_ids: ['1234567890123456789'],
      editable_until_msecs: '0',
      is_edit_eligible: false,
      edits_remaining: '0',
    },
    isEdited: false,
    isStaleEdit: false,
    favorite_count: 0,
    conversation_count: 0,
    news_action_type: 'conversation',
    entities: {
      hashtags: [],
      user_mentions: [],
      urls: [],
      symbols: [],
      media: [],
    },
  }
}

export type Snapshot =
  | 'plain'
  | 'links'
  | 'long'
  | 'rtl'
  | 'encoded'
  | 'empty'
  | 'missing'
  | 'invalid'
  | 'photo'
  | 'two-photos'
  | 'three-photos'
  | 'four-photos'
  | 'video'
  | 'gif'
  | 'mixed-media'
  | 'sensitive'
  | 'unavailable'
  | 'broken-media'
  | 'quote'
  | 'reply'
  | 'verified'
  | 'edited'
  | 'stale-edit'
  | 'note'
  | 'counts'
  | 'legacy-media'

export function createSnapshot(name: Snapshot): Tweet | null {
  if (name === 'missing') return null
  // Deliberately exercise the public element's runtime validation boundary.
  if (name === 'invalid') return { text: 'Incomplete snapshot' } as Tweet
  const texts = {
    plain: 'Hello 😀 中文!\nTwo lines,  two spaces, and a saved snapshot.',
    links: '😀 @example #Astro https://t.co/demo',
    long: (
      'A long paragraph with 中文 and emoji 😀. '.repeat(20) + '\n\n'
    ).repeat(10),
    rtl: 'مرحبا بالعالم\nنص عربي مع English و 😀',
    encoded: 'A &amp; B\n&lt;script&gt;literal text&lt;/script&gt; &amp;lt;',
    empty: '',
  }
  const tweet = createTweet(
    Object.hasOwn(texts, name)
      ? texts[name as keyof typeof texts]
      : `Snapshot: ${name}`,
  )
  addMediaSnapshot(tweet, name)
  if (name === 'rtl') tweet.lang = 'ar'
  if (name === 'links' && tweet.entities) {
    tweet.entities.user_mentions = [
      {
        indices: [2, 10],
        id_str: '42',
        name: 'Example Author',
        screen_name: 'example',
      },
    ]
    tweet.entities.hashtags = [{ indices: [11, 17], text: 'Astro' }]
    tweet.entities.urls = [
      {
        indices: [18, 34],
        url: 'https://t.co/demo',
        expanded_url: 'https://astro.build/',
        display_url: 'astro.build',
      },
    ]
  }
  return tweet
}
