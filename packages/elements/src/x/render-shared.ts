import type { TweetBase } from '@post-embed/types/internal/tweet/tweet'
import { html, nothing, type TemplateResult } from 'lit-html'

import { getSafeUrl } from './safe-url.ts'

export function renderLink(
  content: string | TemplateResult,
  destination?: string,
) {
  const href = destination && getSafeUrl(destination)
  return href
    ? html`<a href=${href} target="_blank" rel="noopener noreferrer"
        >${content}</a
      >`
    : content
}

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
  if (!Number.isFinite(date.getTime())) return nothing
  return renderLink(
    html`<time datetime=${date.toISOString()}
      >${new Intl.DateTimeFormat('en', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'UTC',
      }).format(date)}
      UTC</time
    >`,
    getPermalink(tweet),
  )
}

export function formatCount(count: number): string {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0)
}
