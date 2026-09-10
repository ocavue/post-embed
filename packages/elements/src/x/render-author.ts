import type { TweetUser } from '@post-embed/types/internal/tweet/user'
import el from 'crelt'
import { decodeHTML } from 'entities'

import { renderLink } from './render-shared.ts'
import { getSafeUrl } from './safe-url.ts'

export function renderAuthor(user: TweetUser, follow = false) {
  if (!user.name && !user.screen_name) return
  const validHandle = /^\w{1,15}$/.test(user.screen_name)
  const avatar = getSafeUrl(user.profile_image_url_https)
  const label = user.highlighted_label
  const badge = label?.badge && getSafeUrl(label.badge.url)
  const verified =
    user.verified_type ||
    (user.is_blue_verified ? 'Blue' : user.verified ? 'Legacy' : undefined)

  return el(
    'header',
    { 'data-author': '' },
    avatar
      ? el('img', {
          'data-avatar': '',
          'data-shape': user.profile_image_shape,
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
        el('bdi', {}, decodeHTML(user.name || user.screen_name)),
        verified
          ? el(
              'span',
              {
                'data-verified': verified,
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
                decodeHTML(label.description || ''),
              ),
              label.url?.url,
            )
          : undefined,
      ),
      user.screen_name
        ? el(
            'bdi',
            {},
            renderLink(
              `@${user.screen_name}`,
              validHandle ? `https://x.com/${user.screen_name}` : undefined,
            ),
          )
        : undefined,
      follow && validHandle
        ? el(
            'span',
            { 'data-follow': '' },
            renderLink(
              'Follow',
              `https://x.com/intent/follow?screen_name=${user.screen_name}`,
            ),
          )
        : undefined,
    ),
  )
}
