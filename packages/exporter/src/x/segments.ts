import type { XPostSegment } from '@post-embed/types'
import { decodeHTML } from 'entities'

/**
 * The Twitter REST v1.1 entity shape that the syndication API and the
 * GraphQL API share. Every index is a code point offset into the escaped
 * text.
 */
export interface EntityInput {
  hashtags?: { indices?: number[]; text?: string }[]
  symbols?: { indices?: number[]; text?: string }[]
  user_mentions?: { indices?: number[]; screen_name?: string }[]
  urls?: { indices?: number[]; display_url?: string; expanded_url?: string }[]
  media?: { indices?: number[] }[]
}

interface Link {
  start: number
  end: number
  text: string
  url: string
}

function toLinks(entities: EntityInput): { links: Link[]; mediaStart: number } {
  const links: Link[] = []
  let mediaStart = Infinity
  const add = <T extends { indices?: number[] }>(
    items: T[] | undefined,
    make: (item: T) => Pick<Link, 'text' | 'url'>,
  ) => {
    for (const item of items ?? []) {
      const [start, end] = item.indices ?? []
      if (start === undefined || end === undefined) continue
      links.push({ start, end, ...make(item) })
    }
  }
  add(entities.hashtags, (item) => ({
    text: `#${item.text ?? ''}`,
    url: `https://x.com/hashtag/${item.text ?? ''}`,
  }))
  add(entities.symbols, (item) => ({
    text: `$${item.text ?? ''}`,
    url: `https://x.com/search?q=%24${item.text ?? ''}`,
  }))
  add(entities.user_mentions, (item) => ({
    text: `@${item.screen_name ?? ''}`,
    url: `https://x.com/${item.screen_name ?? ''}`,
  }))
  add(entities.urls, (item) => ({
    text: item.display_url ?? item.expanded_url ?? '',
    url: item.expanded_url ?? '',
  }))
  for (const item of entities.media ?? []) {
    const start = item.indices?.[0]
    if (start !== undefined) mediaStart = Math.min(mediaStart, start)
  }
  links.sort((a, b) => a.start - b.start)
  return { links, mediaStart }
}

/**
 * Split the escaped source text of a post into renderable segments.
 *
 * `range` is the source's `display_text_range`. The syndication API counts
 * its end in UTF-16 code units while entity indices count code points, so
 * the end is only trusted up to the first media entity and the text length.
 * Text is decoded after slicing because the indices count the escaped text.
 */
export function toSegments(
  text: string,
  range: readonly number[] | undefined,
  entities: EntityInput = {},
): XPostSegment[] {
  const chars = Array.from(text)
  const { links, mediaStart } = toLinks(entities)
  const start = Math.max(0, range?.[0] ?? 0)
  const end = Math.min(chars.length, range?.[1] ?? chars.length, mediaStart)
  const segments: XPostSegment[] = []
  const pushText = (from: number, to: number) => {
    if (to <= from) return
    const value = decodeHTML(chars.slice(from, to).join(''))
    if (value) segments.push({ type: 'text', text: value })
  }
  let cursor = start
  for (const link of links) {
    if (link.start < cursor || link.start >= end) continue
    pushText(cursor, link.start)
    if (link.end <= end && link.url) {
      segments.push({
        type: 'link',
        text: decodeHTML(link.text),
        url: link.url,
      })
    }
    cursor = Math.min(link.end, end)
  }
  pushText(cursor, end)
  const last = segments.at(-1)
  if (last?.type === 'text') {
    last.text = last.text.trimEnd()
    if (!last.text) segments.pop()
  }
  return segments
}

/**
 * The plain text of a body, for previews and search.
 */
export function segmentsToText(segments: readonly XPostSegment[]): string {
  return segments.map((segment) => segment.text).join('')
}
