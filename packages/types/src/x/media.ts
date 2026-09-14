import type { XPost, XPostBase, XPostMedia } from './post.js'


// FIXME: I do not like the name "XMediaUrlPolicy". let's call it UrlResolver or UrlMapper instead.
export type XMediaUrlPolicy = (url: string) => string | undefined

export function mapXPostMediaUrls(post: XPost, map: XMediaUrlPolicy): XPost {
  function mapBase(entry: XPostBase): XPostBase {
    const author = { ...entry.author }
    if (author.avatar) {
      const avatar = map(author.avatar)
      if (avatar) author.avatar = avatar
      else delete author.avatar
    }
    const result: XPostBase = { ...entry, author }
    if (entry.media)
      result.media = entry.media.flatMap((media): XPostMedia[] => {
        if (media.type === 'photo') {
          const url = map(media.url)
          return url ? [{ ...media, url }] : []
        }
        const next = {
          ...media,
          sources: media.sources.flatMap((source) => {
            const url = map(source.url)
            return url ? [{ ...source, url }] : []
          }),
        }
        if (media.poster) {
          const poster = map(media.poster)
          if (poster) next.poster = poster
          else delete next.poster
        }
        return [next]
      })
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
