import type { EnrichedTweet } from '@post-embed/types'
import type { EnrichedQuotedTweet } from '@post-embed/types/internal/tweet/enriched-tweet'
import el from 'crelt'
import { decodeHTML } from 'entities'

import { renderLink } from '../render-link.ts'

import { renderAuthor } from './render-author.ts'
import { renderMedia } from './render-media.ts'
import { formatCount, getPermalink, renderDate } from './render-shared.ts'

type Post = EnrichedTweet | EnrichedQuotedTweet

function renderBody(tweet: Post) {
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
            : renderLink(decodeHTML(entity.text), entity.href)
        }),
    ),
    tweet.note_tweet && permalink
      ? [' ', renderLink('Show more', permalink)]
      : undefined,
  )
}

function renderEdit(tweet: Post) {
  return tweet.isStaleEdit
    ? el(
        'span',
        { 'data-edited': '' },
        'This is an earlier version. ',
        renderLink('View latest on X', getPermalink(tweet)),
      )
    : tweet.isEdited
      ? el('span', { 'data-edited': '' }, 'Edited')
      : undefined
}

function renderQuoted(tweet: EnrichedQuotedTweet) {
  const permalink = getPermalink(tweet)
  return el(
    'article',
    { 'data-quoted': '', 'aria-label': 'Quoted post' },
    renderAuthor(tweet.user),
    renderBody(tweet),
    renderMedia(tweet, permalink),
    el(
      'footer',
      { 'data-footer': '' },
      renderDate(tweet),
      renderEdit(tweet),
      permalink ? renderLink('View quoted post on X', permalink) : undefined,
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

function renderActions(tweet: EnrichedTweet, permalink: string) {
  const button = el('button', { type: 'button' }, 'Copy link')
  const status = el('span', { role: 'status', 'aria-live': 'polite' })
  button.addEventListener('click', () => {
    void copyLink(button, status, permalink)
  })
  return el(
    'div',
    { 'data-actions': '' },
    renderLink(`Like · ${formatCount(tweet.favorite_count)}`, tweet.like_url),
    renderLink('Reply', tweet.reply_url),
    button,
    status,
  )
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
  return el(
    'article',
    {},
    renderAuthor(tweet.user, true),
    replyHandle
      ? el(
          'div',
          { 'data-reply-to': '' },
          renderLink(`Replying to @${replyHandle}`, replyUrl),
        )
      : undefined,
    renderBody(tweet),
    renderMedia(tweet, permalink),
    tweet.quoted_tweet ? renderQuoted(tweet.quoted_tweet) : undefined,
    el(
      'footer',
      { 'data-footer': '' },
      renderDate(tweet),
      renderEdit(tweet),
      permalink
        ? [
            renderLink('View on X', permalink),
            renderActions(tweet, permalink),
            renderLink(
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
