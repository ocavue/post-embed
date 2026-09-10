import type { EnrichedTweet } from '@post-embed/types'
import { decodeHTML } from 'entities'
import { html, nothing } from 'lit-html'
import { ifDefined } from 'lit-html/directives/if-defined.js'

import { getSafeUrl } from './safe-url.ts'

function renderLink(text: string, destination: string) {
  const href = getSafeUrl(destination)
  return href
    ? html`<a href=${href} target="_blank" rel="noopener noreferrer"
        >${text}</a
      >`
    : text
}

function renderText(text: string) {
  return text
    .split('\n')
    .map((line, index) => html`${index ? html`<br />` : nothing}${line}`)
}

export function renderTweet(tweet: EnrichedTweet) {
  const validHandle = /^\w{1,15}$/.test(tweet.user.screen_name)
  const author = tweet.user.name || tweet.user.screen_name
  const permalink =
    validHandle && /^\d+$/.test(tweet.id_str)
      ? getSafeUrl(tweet.url)
      : undefined
  const entities = tweet.entities.filter((entity) => entity.type !== 'media')
  const hasText = entities.some((entity) => entity.text.length > 0)

  const body = hasText
    ? entities.map((entity) => {
        return entity.type === 'text'
          ? renderText(decodeHTML(entity.text))
          : renderLink(entity.text, entity.href)
      })
    : 'No text available'

  const content = html`<span style="white-space: pre-wrap">${body}</span>`

  return html`<article>
    ${
      author
        ? html`<header data-post-part="author">
            <bdi>${tweet.user.name}</bdi>
            ${tweet.user.screen_name ? html`<bdi>${validHandle ? renderLink(`@${tweet.user.screen_name}`, tweet.user.url) : `@${tweet.user.screen_name}`}</bdi>` : nothing}
          </header>`
        : nothing
    }
    <p
      data-post-part="body"
      dir="auto"
      lang=${ifDefined(tweet.lang || undefined)}
    >
      ${content}
    </p>
    ${permalink ? html`<footer data-post-part="footer">${renderLink('View on X', permalink)}</footer>` : nothing}
  </article>`
}
