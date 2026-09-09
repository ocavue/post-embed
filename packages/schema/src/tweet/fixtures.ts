import type { Tweet, EnrichedTweet } from '@post-embed/types'
const base = {
  lang: 'en',
  created_at: '2026-09-09T00:00:00.000Z',
  display_text_range: [0, 4] as [number, number],
  entities: {
    hashtags: [],
    urls: [],
    user_mentions: [],
    symbols: [],
    media: [],
  },
  id_str: '1234567890123456789',
  text: 'Hi 😀',
  user: {
    id_str: '42',
    name: 'Example',
    screen_name: 'example',
    profile_image_url_https: 'https://example.com/avatar.jpg',
    profile_image_shape: 'Circle' as const,
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
}
export const mediaBase = {
  display_url: 'pic.x.com/example',
  expanded_url: 'https://x.com/example/status/1234567890123456789/photo/1',
  ext_media_availability: { status: 'Available' },
  ext_media_color: { palette: [] },
  indices: [4, 4] as [number, number],
  media_url_https: 'https://example.com/photo.jpg',
  original_info: { height: 100, width: 100, focus_rects: [] },
  sizes: {
    large: { h: 100, w: 100, resize: 'fit' },
    medium: { h: 100, w: 100, resize: 'fit' },
    small: { h: 100, w: 100, resize: 'fit' },
    thumb: { h: 100, w: 100, resize: 'crop' },
  },
  url: 'https://t.co/example',
}
export const raw: Tweet = {
  ...base,
  photos: [],
  __typename: 'Tweet',
  favorite_count: 1,
  conversation_count: 2,
  news_action_type: 'conversation',
  mediaDetails: [
    { ...mediaBase, type: 'photo', ext_alt_text: 'A photo' },
    {
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
    },
  ],
  quoted_tweet: {
    ...base,
    id_str: '2',
    mediaDetails: [],
    reply_count: 0,
    retweet_count: 0,
    favorite_count: 0,
    self_thread: { id_str: '2' },
  },
}
export const enriched: EnrichedTweet = {
  ...raw,
  url: 'https://x.com/example/status/1234567890123456789',
  user: {
    ...raw.user,
    url: 'https://x.com/example',
    follow_url: 'https://x.com/intent/follow?screen_name=example',
  },
  like_url: 'https://x.com/intent/like?tweet_id=1234567890123456789',
  reply_url: 'https://x.com/intent/tweet?in_reply_to=1234567890123456789',
  entities: [{ type: 'text', text: raw.text, indices: [0, 4] }],
  quoted_tweet: {
    ...raw.quoted_tweet!,
    url: 'https://x.com/example/status/2',
    entities: [{ type: 'text', text: raw.text, indices: [0, 4] }],
  },
}
