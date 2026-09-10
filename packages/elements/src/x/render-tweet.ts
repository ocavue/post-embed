import type { EnrichedTweet } from '@post-embed/types'
import type { EnrichedQuotedTweet } from '@post-embed/types/internal/tweet/enriched-tweet'
import { decodeHTML } from 'entities'

import type { DOMFactory } from '../typed-dom-helper.ts'

import { renderAuthor } from './render-author.ts'
import { renderMedia } from './render-media.ts'
import {
  formatCount,
  getPermalink,
  renderDate,
  renderLink,
} from './render-shared.ts'

type Post = EnrichedTweet | EnrichedQuotedTweet

function renderBody(el: DOMFactory, tweet: Post) {
  const permalink = getPermalink(tweet)
  return el(
    'p',
    { 'data-body': '', dir: 'auto', lang: tweet.lang || undefined },
    el(
      'span',
      { 'data-text': '' },
      tweet.entities
        .filter((entity) => entity.type !== 'media')
        .map((entity) => {
          return entity.type === 'text'
            ? decodeHTML(entity.text)
                .split('\n')
                .map((line, index) => {
                  return [index ? el('br', {}) : undefined, line]
                })
            : renderLink(el, decodeHTML(entity.text), entity.href)
        }),
    ),
    tweet.note_tweet && permalink
      ? [' ', renderLink(el, 'Show more', permalink)]
      : undefined,
  )
}

function renderEdit(el: DOMFactory, tweet: Post) {
  return tweet.isStaleEdit
    ? el(
        'span',
        { 'data-edited': '' },
        'This is an earlier version. ',
        renderLink(el, 'View latest on X', getPermalink(tweet)),
      )
    : tweet.isEdited
      ? el('span', { 'data-edited': '' }, 'Edited')
      : undefined
}

function renderQuoted(
  el: DOMFactory,
  tweet: EnrichedQuotedTweet,
  sensitive: boolean,
) {
  const permalink = getPermalink(tweet)
  return el(
    'article',
    { 'data-quoted': '', 'aria-label': 'Quoted post' },
    renderAuthor(el, tweet.user),
    renderBody(el, tweet),
    renderMedia(el, tweet, permalink, sensitive),
    el(
      'footer',
      { 'data-footer': '' },
      renderDate(el, tweet),
      renderEdit(el, tweet),
      permalink
        ? renderLink(el, 'View quoted post on X', permalink)
        : undefined,
    ),
  )
}

async function copyLink(
  button: HTMLButtonElement,
  status: HTMLElement,
  url: string,
) {
  try {
    const clipboard = button.ownerDocument.defaultView?.navigator.clipboard
    if (!clipboard) throw new Error('Clipboard is unavailable')
    await clipboard.writeText(url)
    if (button.isConnected) status.textContent = 'Link copied.'
  } catch {
    if (button.isConnected)
      status.textContent = 'Could not copy. Use the View on X link.'
  }
}

function renderActions(
  el: DOMFactory,
  tweet: EnrichedTweet,
  permalink: string,
) {
  const button = el('button', { type: 'button' }, 'Copy link')
  const status = el('span', { role: 'status', 'aria-live': 'polite' })
  button.addEventListener('click', () => {
    void copyLink(button, status, permalink)
  })
  return el(
    'div',
    { 'data-actions': '' },
    renderLink(
      el,
      `Like · ${formatCount(tweet.favorite_count)}`,
      tweet.like_url,
    ),
    renderLink(el, 'Reply', tweet.reply_url),
    button,
    status,
  )
}

export function renderTweet(el: DOMFactory, tweet: EnrichedTweet) {
  const permalink = getPermalink(tweet)
  const replyHandle = tweet.in_reply_to_screen_name
  const replyUrl =
    replyHandle &&
    /^\w{1,15}$/.test(replyHandle) &&
    /^\d+$/.test(tweet.in_reply_to_status_id_str || '')
      ? tweet.in_reply_to_url
      : undefined
  return el(
    'article',
    {},
    renderAuthor(el, tweet.user, true),
    replyHandle
      ? el(
          'div',
          { 'data-reply-to': '' },
          renderLink(el, `Replying to @${replyHandle}`, replyUrl),
        )
      : undefined,
    renderBody(el, tweet),
    renderMedia(el, tweet, permalink, tweet.possibly_sensitive),
    tweet.quoted_tweet
      ? renderQuoted(el, tweet.quoted_tweet, Boolean(tweet.possibly_sensitive))
      : undefined,
    el(
      'footer',
      { 'data-footer': '' },
      renderDate(el, tweet),
      renderEdit(el, tweet),
      permalink
        ? [
            renderLink(el, 'View on X', permalink),
            renderActions(el, tweet, permalink),
            renderLink(
              el,
              tweet.conversation_count > 0
                ? `Read ${formatCount(tweet.conversation_count)} ${tweet.conversation_count === 1 ? 'reply' : 'replies'} on X`
                : 'Read more on X',
              permalink,
            ),
          ]
        : undefined,
    ),
  )
}
