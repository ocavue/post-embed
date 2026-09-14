import type { XPost, XPostBase } from '@post-embed/types'

/*


FIXME this mapXPostMediaUrls is too complex. I want to split it into smaller internal top-level functions. for example

type Mapper = (url: string) => string

function mapXPostAuthor(entry: XPostAuthor, mapper: Mapper): XPostAuthor { ... }
function mapXPostMedia(entry: XPostMedia, mapper: Mapper): XPostMedia {...}
function mapXPostBase(entry: XPostBase, mapper: Mapper): XPostBase { ... }
export function mapXPostMediaUrls(post: XPost, resolve: ): XPost {
  const mapper: Mapper = (url) => resolve(url) || url
  return ...
}

*/


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

// FIXME: unused. No caller in post-embed, meowdown or reflect-open (Rust derives the URL list
// itself in `media_urls`). Delete it and its export from index.ts.
export function getXPostMediaUrls(post: XPost): string[] {
  const result: string[] = []
  mapXPostMediaUrls(post, (url) => {
    result.push(url)
    return url
  })
  return result
}
