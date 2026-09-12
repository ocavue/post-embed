import type { TweetBase } from '@post-embed/types/internal/tweet/tweet'
import el from 'crelt'

import { renderLink } from '../render-link.ts'

export function getPermalink(
  tweet: Pick<TweetBase, 'id_str' | 'user' | 'created_at'>,
): string | undefined {
  return /^\w{1,15}$/.test(tweet.user.screen_name) && /^\d+$/.test(tweet.id_str)
    ? `https://x.com/${tweet.user.screen_name}/status/${tweet.id_str}`
    : undefined
}

export function renderDate(
  tweet: Pick<TweetBase, 'id_str' | 'user' | 'created_at'>,
) {
  const date = new Date(tweet.created_at)
  if (!Number.isFinite(date.getTime())) return
  return renderLink(
    el(
      'time',
      { datetime: date.toISOString() },
      new Intl.DateTimeFormat('en', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'UTC',
      }).format(date),
      ' UTC',
    ),
    getPermalink(tweet),
  )
}
