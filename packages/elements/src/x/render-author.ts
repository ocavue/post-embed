import type { XPostAuthor } from '@post-embed/types'
import el from 'crelt'

import { renderLink } from '../render-link.ts'
import { getSafeUrl } from '../safe-url.ts'

const VERIFIED_LABELS = {
  blue: 'Blue',
  business: 'Business',
  government: 'Government',
  legacy: 'Legacy',
}

export function renderAuthor(author: XPostAuthor) {
  if (!author.name && !author.handle) return
  const validHandle = /^\w{1,15}$/.test(author.handle)
  const avatar = author.avatar && getSafeUrl(author.avatar)
  const label = author.label
  const badge = label?.badge && getSafeUrl(label.badge)
  const verified = author.verified && VERIFIED_LABELS[author.verified]

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
        verified
          ? el(
              'span',
              {
                'data-verified': author.verified,
                role: 'img',
                'aria-label': `${verified} verified account`,
                title: `${verified} verified account`,
              },
              '✓',
            )
          : undefined,
        label
          ? renderLink(
              el(
                'span',
                { 'data-label': '' },
                badge
                  ? el('img', {
                      src: badge,
                      alt: '',
                      width: 20,
                      height: 20,
                      loading: 'lazy',
                      referrerpolicy: 'no-referrer',
                    })
                  : undefined,
                label.text,
              ),
              label.url,
            )
          : undefined,
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
