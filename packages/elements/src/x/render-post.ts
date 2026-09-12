import type { XPost, XPostBase } from '@post-embed/types'
import el from 'crelt'

import { renderLink } from '../render-link.ts'

import { renderAuthor } from './render-author.ts'
import { renderMedia } from './render-media.ts'
import { getPermalink, renderDate } from './render-shared.ts'

function renderBody(post: XPostBase) {
  const permalink = getPermalink(post)
  return el(
    'p',
    { 'data-body': '', dir: 'auto', lang: post.lang || undefined },
    el(
      'span',
      { 'data-text': '' },
      post.body.map((segment) => {
        return segment.type === 'link'
          ? renderLink(segment.text, segment.url)
          : segment.text.split('\n').map((line, index) => {
              return [index ? el('br', {}) : undefined, line]
            })
      }),
    ),
    post.truncated && permalink
      ? [' ', renderLink('Show more', permalink)]
      : undefined,
  )
}

function renderEdit(post: XPostBase) {
  return post.edit === 'stale'
    ? el(
        'span',
        { 'data-edited': '' },
        'This is an earlier version. ',
        renderLink('View latest', getPermalink(post)),
      )
    : post.edit === 'edited'
      ? el('span', { 'data-edited': '' }, 'Edited')
      : undefined
}

function renderQuoted(post: XPostBase) {
  return el(
    'article',
    { 'data-quoted': '', 'aria-label': 'Quoted post' },
    renderAuthor(post.author),
    renderBody(post),
    renderMedia(post.media, getPermalink(post)),
    el('footer', { 'data-footer': '' }, renderDate(post), renderEdit(post)),
  )
}

export function renderPost(post: XPost) {
  const reply = post.replyTo
  const replyUrl =
    reply && /^\w{1,15}$/.test(reply.handle) && /^\d+$/.test(reply.id)
      ? `https://x.com/${reply.handle}/status/${reply.id}`
      : undefined
  return el(
    'article',
    {},
    renderAuthor(post.author),
    reply
      ? el(
          'div',
          { 'data-reply-to': '' },
          renderLink(`Replying to @${reply.handle}`, replyUrl),
        )
      : undefined,
    renderBody(post),
    renderMedia(post.media, getPermalink(post)),
    post.quote ? renderQuoted(post.quote) : undefined,
    el('footer', { 'data-footer': '' }, renderDate(post), renderEdit(post)),
  )
}
