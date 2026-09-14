import type { XPost, XPostBase } from './post.js'

export type MediaUrlResolver = (url: string) => string | undefined

// FIXME: `mapBase(post)` already spreads the whole post (quote/replyTo included, the `XPostBase`
// annotation is narrower than the runtime value), so the leading `...post` is redundant. Also:
// `@post-embed/types` was a type-only package; this file and url.ts add runtime code, tests, and an
// inline `types` vitest project in the root config. Consider hosting these helpers in
// `@post-embed/schema` (already runtime) instead.
export function mapXPostMediaUrls(
  post: XPost,
  resolve: MediaUrlResolver,
): XPost {
  const url = (source: string): string => resolve(source) || source
  function mapBase(entry: XPostBase): XPostBase {
    const author = { ...entry.author }
    if (author.avatar) author.avatar = url(author.avatar)
    const result: XPostBase = { ...entry, author }
    if (entry.media) {
      result.media = entry.media.map((media) => {
        if (media.type === 'photo') return { ...media, url: url(media.url) }
        const next = {
          ...media,
          sources: media.sources.map((source) => ({
            ...source,
            url: url(source.url),
          })),
        }
        if (media.poster) next.poster = url(media.poster)
        return next
      })
    }
    return result
  }
  return {
    ...post,
    ...mapBase(post),
    ...(post.quote ? { quote: mapBase(post.quote) } : {}),
  }
}

export function getXPostMediaUrls(post: XPost): string[] {
  const result: string[] = []
  mapXPostMediaUrls(post, (url) => {
    result.push(url)
    return url
  })
  return result
}
