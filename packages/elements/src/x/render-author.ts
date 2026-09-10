import type { TweetUser } from '@post-embed/types/internal/tweet/user'
import { decodeHTML } from 'entities'
import { html, nothing } from 'lit-html'

import { renderLink } from './render-shared.ts'
import { getSafeUrl } from './safe-url.ts'

export function renderAuthor(user: TweetUser, follow = false) {
  if (!user.name && !user.screen_name) return nothing
  const validHandle = /^\w{1,15}$/.test(user.screen_name)
  const avatar = getSafeUrl(user.profile_image_url_https)
  const label = user.highlighted_label
  const badge = label?.badge && getSafeUrl(label.badge.url)
  const verified =
    user.verified_type ||
    (user.is_blue_verified ? 'Blue' : user.verified ? 'Legacy' : undefined)
  return html`<header data-author>
    ${avatar ? html`<img data-avatar data-shape=${user.profile_image_shape} src=${avatar} alt="" width="48" height="48" loading="lazy" decoding="async" referrerpolicy="no-referrer" />` : nothing}
    <div data-author-details>
      <div data-author-name>
        <bdi>${decodeHTML(user.name || user.screen_name)}</bdi>
        ${verified ? html`<span data-verified=${verified} role="img" aria-label=${`${verified} verified account`} title=${`${verified} verified account`}>✓</span>` : nothing}
        ${label ? renderLink(html`<span data-label>${badge ? html`<img src=${badge} alt="" width="20" height="20" loading="lazy" referrerpolicy="no-referrer" />` : nothing}${decodeHTML(label.description || '')}</span>`, label.url?.url) : nothing}
      </div>
      ${user.screen_name ? html`<bdi>${renderLink(`@${user.screen_name}`, validHandle ? `https://x.com/${user.screen_name}` : undefined)}</bdi>` : nothing}
      ${follow && validHandle ? html`<span data-follow>${renderLink('Follow', `https://x.com/intent/follow?screen_name=${user.screen_name}`)}</span>` : nothing}
    </div>
  </header>`
}
