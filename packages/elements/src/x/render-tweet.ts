import type { EnrichedTweet } from '@post-embed/types'
import type { EnrichedQuotedTweet } from '@post-embed/types/internal/tweet/enriched-tweet'
import { decodeHTML } from 'entities'
import { html, nothing } from 'lit-html'
import { ifDefined } from 'lit-html/directives/if-defined.js'

import { renderAuthor } from './render-author.ts'
import { renderMedia } from './render-media.ts'
import {
  formatCount,
  getPermalink,
  renderDate,
  renderLink,
} from './render-shared.ts'
import { enrichTweet } from './utils.ts'

type Post = EnrichedTweet | EnrichedQuotedTweet

function renderBody(tweet: Post) {
  return html`<p
    data-body
    dir="auto"
    lang=${ifDefined(tweet.lang || undefined)}
  >
    <span data-text
      >${tweet.entities
        .filter((entity) => entity.type !== 'media')
        .map((entity) => {
          return entity.type === 'text'
            ? decodeHTML(entity.text)
                .split('\n')
                .map((line, index) => {
                  return html`${index ? html`<br />` : nothing}${line}`
                })
            : renderLink(decodeHTML(entity.text), entity.href)
        })}</span
    >${tweet.note_tweet && getPermalink(tweet) ? html` ${renderLink('Show more', getPermalink(tweet))}` : nothing}
  </p>`
}

function renderEdit(tweet: Post) {
  return tweet.isStaleEdit
    ? html`<span data-edited
        >This is an earlier version.
        ${renderLink('View latest on X', getPermalink(tweet))}</span
      >`
    : tweet.isEdited
      ? html`<span data-edited>Edited</span>`
      : nothing
}

function renderQuoted(tweet: Post, sensitive: boolean, parent = false) {
  return html`<article
    data-quoted
    aria-label=${parent ? 'Parent post' : 'Quoted post'}
  >
    ${renderAuthor(tweet.user)}${renderBody(tweet)}${renderMedia(tweet, getPermalink(tweet), sensitive)}
    <footer data-footer>
      ${renderDate(tweet)}${renderEdit(tweet)}${getPermalink(tweet) ? renderLink(parent ? 'View parent on X' : 'View quoted post on X', getPermalink(tweet)) : nothing}
    </footer>
  </article>`
}

async function copyLink(event: Event, url: string) {
  const button = event.currentTarget as HTMLButtonElement
  const status = button.nextElementSibling!
  try {
    await navigator.clipboard.writeText(url)
    if (button.isConnected) status.textContent = 'Link copied.'
  } catch {
    if (button.isConnected)
      status.textContent = 'Could not copy. Use the View on X link.'
  }
}

export function renderTweet(tweet: EnrichedTweet) {
  const permalink = getPermalink(tweet)
  const replyHandle = tweet.in_reply_to_screen_name
  const replyUrl =
    replyHandle &&
    /^\w{1,15}$/.test(replyHandle) &&
    /^\d+$/.test(tweet.in_reply_to_status_id_str || '')
      ? tweet.in_reply_to_url
      : undefined
  return html`<article>
    ${tweet.parent ? renderQuoted(enrichTweet({ ...tweet.parent, __typename: 'Tweet', conversation_count: tweet.parent.reply_count, news_action_type: 'conversation' }), false, true) : nothing}
    ${renderAuthor(tweet.user, true)}
    ${replyHandle ? html`<div data-reply-to>${renderLink(`Replying to @${replyHandle}`, replyUrl)}</div>` : nothing}
    ${renderBody(tweet)}
    ${renderMedia(tweet, permalink, tweet.possibly_sensitive)}
    ${tweet.quoted_tweet ? renderQuoted(tweet.quoted_tweet, Boolean(tweet.possibly_sensitive)) : nothing}
    <footer data-footer>
      ${renderDate(tweet)}${renderEdit(tweet)}
      ${
        permalink
          ? html`${renderLink('View on X', permalink)}
              <div data-actions>
                ${renderLink(`Like · ${formatCount(tweet.favorite_count)}`, tweet.like_url)}
                ${renderLink('Reply', tweet.reply_url)}
                <button
                  type="button"
                  @click=${(event: Event) => copyLink(event, permalink)}
                >
                  Copy link</button
                ><span role="status" aria-live="polite"></span>
              </div>
              ${renderLink(tweet.conversation_count > 0 ? `Read ${formatCount(tweet.conversation_count)} ${tweet.conversation_count === 1 ? 'reply' : 'replies'} on X` : 'Read more on X', permalink)}`
          : nothing
      }
    </footer>
  </article>`
}
