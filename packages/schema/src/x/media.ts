import type { XPost, XPostBase } from '@post-embed/types'

export function mapXPostMediaUrls(
  post: XPost,
  resolve: (url: string) => string | undefined,
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
