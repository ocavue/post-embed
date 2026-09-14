import type { XPost, XPostBase, XPostMedia } from './post.js'
export type MediaRole = 'img' | 'video'
export type XMediaUrlPolicy = (
  url: string,
  role: MediaRole,
) => string | undefined

export function mapXPostMediaUrls(post: XPost, map: XMediaUrlPolicy): XPost {
  function mapBase(entry: XPostBase): XPostBase {
    const author = { ...entry.author }
    if (author.avatar) {
      const avatar = map(author.avatar, 'img')
      if (avatar) author.avatar = avatar
      else delete author.avatar
    }
    const result: XPostBase = { ...entry, author }
    if (entry.media)
      result.media = entry.media.flatMap((media): XPostMedia[] => {
        if (media.type === 'photo') {
          const url = map(media.url, 'img')
          return url ? [{ ...media, url }] : []
        }
        const next = {
          ...media,
          sources: media.sources.flatMap((source) => {
            const url = map(source.url, 'video')
            return url ? [{ ...source, url }] : []
          }),
        }
        if (media.poster) {
          const poster = map(media.poster, 'img')
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
export function getXPostMediaUrls(
  post: XPost,
): Array<{ url: string; role: MediaRole }> {
  const result: Array<{ url: string; role: MediaRole }> = []
  mapXPostMediaUrls(post, (url, role) => {
    result.push({ url, role })
    return url
  })
  return result
}
