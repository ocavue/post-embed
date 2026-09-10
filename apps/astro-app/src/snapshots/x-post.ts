import type { Tweet } from '@post-embed/types'

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

export function createSnapshot(name: string): Tweet {
  const text =
    name === 'long'
      ? 'A saved paragraph with 中文 and emoji 😀. '.repeat(500)
      : name === 'rtl'
        ? 'مرحبا بالعالم\nنص محفوظ للقراءة دون اتصال'
        : name === 'encoded'
          ? 'A &amp; B\n&lt;script&gt;literal text&lt;/script&gt; &amp;lt;'
          : name === 'empty'
            ? ''
            : 'Hello from a saved post. 😀\nTwo lines,  two spaces, and no network request.'
  const tweet = createTweet(text)
  tweet.lang = name === 'rtl' ? 'ar' : 'en'
  return tweet
}
