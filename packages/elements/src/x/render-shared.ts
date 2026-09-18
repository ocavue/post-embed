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
  short = false,
) {
  const date = new Date(post.createdAt)
  if (!Number.isFinite(date.getTime())) return
  if (short) {
    const sameYear = date.getFullYear() === new Date().getFullYear()
    return renderLink(
      el(
        'time',
        { datetime: date.toISOString() },
        new Intl.DateTimeFormat(undefined, {
          month: 'short',
          day: 'numeric',
          year: sameYear ? undefined : 'numeric',
        }).format(date),
      ),
      getPermalink(post),
    )
  }
  return renderLink(
    el(
      'time',
      { datetime: date.toISOString() },
      new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date),
    ),
    getPermalink(post),
  )
}
