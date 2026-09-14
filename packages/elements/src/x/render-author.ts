import type { XPostAuthor, XMediaUrlPolicy } from '@post-embed/types'
import el from 'crelt'

import { renderLink } from '../render-link.ts'

import { getMediaUrl } from './media-url.ts'

export function renderAuthor(
  author: XPostAuthor,
  policy: XMediaUrlPolicy | null,
) {
  if (!author.name && !author.handle) return
  const validHandle = /^\w{1,15}$/.test(author.handle)
  const avatar = author.avatar && getMediaUrl(author.avatar, policy)

  return el(
    'header',
    { 'data-author': '' },
    avatar
      ? el('img', {
          'data-avatar': '',
          'data-shape': author.avatarShape,
          src: avatar,
          alt: '',
          width: 48,
          height: 48,
          loading: 'lazy',
          decoding: 'async',
          referrerpolicy: 'no-referrer',
        })
      : undefined,
    el(
      'div',
      { 'data-author-details': '' },
      el(
        'div',
        { 'data-author-name': '' },
        el('bdi', {}, author.name || author.handle),
      ),
      author.handle
        ? el(
            'bdi',
            {},
            renderLink(
              `@${author.handle}`,
              validHandle ? `https://x.com/${author.handle}` : undefined,
            ),
          )
        : undefined,
    ),
  )
}
