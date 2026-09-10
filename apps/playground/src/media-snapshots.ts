import type { Tweet } from '@post-embed/types'
import type {
  MediaDetails,
  MediaPhoto,
} from '@post-embed/types/internal/tweet/media'

export function addMediaSnapshot(tweet: Tweet, name: string): void {
  const asset = (file: string) => {
    return new URL(`/media/${file}`, window.location.origin).href
  }
  tweet.user.profile_image_url_https = asset('photo-1.svg')
  const photo = (index: number): MediaPhoto => ({
    type: 'photo',
    ext_alt_text: `Illustrated landscape ${index}`,
    media_url_https: asset(`photo-${index}.svg`),
    display_url: 'pic.x.com/example',
    expanded_url: `https://x.com/example/status/${tweet.id_str}/photo/${index}`,
    url: 'https://t.co/media',
    indices: [0, 0],
    ext_media_availability: { status: 'Available' },
    ext_media_color: { palette: [] },
    original_info: { width: 640, height: 400, focus_rects: [] },
    sizes: {
      large: { w: 640, h: 400, resize: 'fit' },
      medium: { w: 640, h: 400, resize: 'fit' },
      small: { w: 640, h: 400, resize: 'fit' },
      thumb: { w: 150, h: 150, resize: 'crop' },
    },
  })
  const video = (gif = false): MediaDetails => ({
    ...photo(1),
    type: gif ? 'animated_gif' : 'video',
    video_info: {
      aspect_ratio: [8, 5],
      variants: [
        {
          content_type: 'video/mp4',
          bitrate: 256000,
          url: asset('motion.mp4'),
        },
      ],
    },
  })
  if (
    [
      'photo',
      'two-photos',
      'three-photos',
      'four-photos',
      'sensitive',
      'unavailable',
      'broken-media',
    ].includes(name)
  ) {
    const count =
      name === 'two-photos'
        ? 2
        : name === 'three-photos'
          ? 3
          : name === 'four-photos'
            ? 4
            : 1
    tweet.mediaDetails = Array.from({ length: count }, (_, i) => photo(i + 1))
    if (name === 'sensitive') tweet.possibly_sensitive = true
    if (name === 'unavailable')
      tweet.mediaDetails[0].ext_media_availability.status = 'Unavailable'
    if (name === 'broken-media')
      tweet.mediaDetails[0].media_url_https = asset('missing.svg')
  }
  if (name === 'video' || name === 'gif')
    tweet.mediaDetails = [video(name === 'gif')]
  if (name === 'mixed-media') tweet.mediaDetails = [photo(1), video(), photo(2)]
  if (name === 'quote') {
    tweet.quoted_tweet = {
      ...structuredClone(tweet),
      id_str: '987654321',
      text: 'A quoted post with a picture.',
      display_text_range: [0, 29],
      mediaDetails: [photo(2)],
      reply_count: 2,
      retweet_count: 3,
      self_thread: { id_str: '987654321' },
    }
  }
  if (name === 'reply') {
    tweet.in_reply_to_screen_name = 'example'
    tweet.in_reply_to_status_id_str = '987654321'
  }
  if (name === 'verified') {
    tweet.user.verified_type = 'Business'
    tweet.user.profile_image_shape = 'Square'
    tweet.user.highlighted_label = {
      description: 'Post Embed',
      badge: { url: asset('photo-2.svg') },
      url: {
        url: 'https://github.com/ocavue/post-embed',
        url_type: 'DeepLink',
      },
      user_label_type: 'BusinessLabel',
      user_label_display_type: 'Badge',
    }
  }
  if (name === 'edited' || name === 'stale-edit') tweet.isEdited = true
  if (name === 'stale-edit') tweet.isStaleEdit = true
  if (name === 'note') tweet.note_tweet = { id: '1' }
  if (name === 'counts') {
    tweet.favorite_count = 12450
    tweet.conversation_count = 1234
  }
  if (name === 'legacy-media') {
    tweet.photos = [
      {
        url: asset('photo-2.svg'),
        expandedUrl: 'https://x.com/example',
        width: 640,
        height: 400,
        backgroundColor: { red: 0, green: 0, blue: 0 },
        cropCandidates: [],
      },
    ]
    tweet.video = {
      aspectRatio: [8, 5],
      contentType: 'video/mp4',
      durationMs: 2000,
      mediaAvailability: { status: 'Available' },
      poster: asset('photo-1.svg'),
      variants: [{ type: 'video/mp4', src: asset('motion.mp4') }],
      videoId: { type: 'tweet', id: '1' },
      viewCount: 10,
    }
  }
}
