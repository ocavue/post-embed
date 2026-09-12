import type { Tweet } from '@post-embed/types'

import { createSnapshot } from '../snapshots.ts'

function range(text: string, needle: string): [number, number] {
  const start = Array.from(text.slice(0, text.indexOf(needle))).length
  return [start, start + Array.from(needle).length]
}

export function createSamples(): Tweet[] {
  const a = createSnapshot('counts')!
  a.text =
    'Shipped a new version of post-embed: paste saved post data into a custom element and get selectable text, with no requests to X at render time. #webcomponents https://t.co/demo'
  a.display_text_range = [0, Array.from(a.text).length]
  a.user.name = 'Jane Appleseed'
  a.user.screen_name = 'janeapple'
  a.user.is_blue_verified = true
  a.entities!.hashtags = [
    { indices: range(a.text, '#webcomponents'), text: 'webcomponents' },
  ]
  a.entities!.urls = [
    {
      indices: range(a.text, 'https://t.co/demo'),
      url: 'https://t.co/demo',
      expanded_url: 'https://github.com/ocavue/post-embed',
      display_url: 'github.com/ocavue/post-embed',
    },
  ]

  const b = createSnapshot('two-photos')!
  b.text = 'Two frames from this morning 🌅 Same trail, ten minutes apart.'
  b.display_text_range = [0, Array.from(b.text).length]
  b.user.name = 'Trail Notes'
  b.user.screen_name = 'trailnotes'
  b.in_reply_to_screen_name = 'janeapple'
  b.in_reply_to_status_id_str = '987654321'
  b.favorite_count = 87
  b.conversation_count = 4

  const c = createSnapshot('quote')!
  c.text = 'This is exactly the approach we wanted for the docs site.'
  c.display_text_range = [0, Array.from(c.text).length]
  c.user.name = 'Docs Team'
  c.user.screen_name = 'docsteam'
  c.user.verified_type = 'Business'
  c.user.profile_image_shape = 'Square'
  c.favorite_count = 231
  c.conversation_count = 12
  c.quoted_tweet!.user.name = 'Jane Appleseed'
  c.quoted_tweet!.user.screen_name = 'janeapple'
  c.quoted_tweet!.text = 'A quoted post with a picture.'

  return [a, b, c]
}
