import type { Tweet } from '@post-embed/types'

export function createTweet(text = 'Hello 😀\nA saved post.'): Tweet {
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

export function createMediaTweet(): Tweet {
  const tweet = createTweet('Saved text https://t.co/media')
  tweet.entities = {
    hashtags: [],
    user_mentions: [],
    urls: [],
    symbols: [],
    media: [
      {
        indices: [11, 29],
        url: 'https://t.co/media',
        expanded_url: 'https://example.com/photo',
        display_url: 'example.com/photo',
      },
    ],
  }
  tweet.quoted_tweet = {
    ...createTweet('Quoted text https://t.co/media'),
    entities: structuredClone(tweet.entities),
    reply_count: 0,
    retweet_count: 0,
    favorite_count: 0,
    self_thread: { id_str: '2' },
  }
  return tweet
}

export function createPhoto() {
  return {
    type: 'photo' as const,
    ext_alt_text: 'Blue illustrated mountains',
    display_url: 'pic.x.com/example',
    expanded_url: 'https://x.com/example/status/1234567890123456789/photo/1',
    ext_media_availability: { status: 'Available' },
    ext_media_color: { palette: [] },
    indices: [0, 0] as [number, number],
    media_url_https: new URL('./image.svg?no-inline', import.meta.url).href,
    original_info: { height: 400, width: 640, focus_rects: [] },
    sizes: {
      large: { h: 400, w: 640, resize: 'fit' },
      medium: { h: 400, w: 640, resize: 'fit' },
      small: { h: 400, w: 640, resize: 'fit' },
      thumb: { h: 100, w: 100, resize: 'crop' },
    },
    url: 'https://t.co/media',
  }
}
