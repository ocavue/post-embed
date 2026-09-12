import type { XPostBase } from '@post-embed/types'
import el from 'crelt'

import { renderLink } from '../render-link.ts'

export function getPermalink(
  post: Pick<XPostBase, 'id' | 'author'>,
): string | undefined {
  return /^\w{1,15}$/.test(post.author.handle) && /^\d+$/.test(post.id)
    ? `https://x.com/${post.author.handle}/status/${post.id}`
    : undefined
}

export function renderDate(
  post: Pick<XPostBase, 'id' | 'author' | 'createdAt'>,
) {
  const date = new Date(post.createdAt)
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
    getPermalink(post),
  )
}
