import type {
  XPost,
  XPostAuthor,
  XPostBase,
  XPostMedia,
} from '@post-embed/types'

type Mapper = (url: string) => string

function mapXPostAuthor(author: XPostAuthor, mapper: Mapper): XPostAuthor {
  return {
    ...author,
    ...(author.avatar ? { avatar: mapper(author.avatar) } : {}),
  }
}

function mapXPostMedia(media: XPostMedia, mapper: Mapper): XPostMedia {
  if (media.type === 'photo') return { ...media, url: mapper(media.url) }
  return {
    ...media,
    sources: media.sources.map((source) => ({
      ...source,
      url: mapper(source.url),
    })),
    ...(media.poster ? { poster: mapper(media.poster) } : {}),
  }
}

function mapXPostBase(post: XPostBase, mapper: Mapper): XPostBase {
  return {
    ...post,
    author: mapXPostAuthor(post.author, mapper),
    ...(post.media
      ? { media: post.media.map((media) => mapXPostMedia(media, mapper)) }
      : {}),
  }
}

export function mapXPostMediaUrls(
  post: XPost,
  resolve: (url: string) => string | undefined,
): XPost {
  const mapper: Mapper = (url) => resolve(url) || url
  return {
    ...mapXPostBase(post, mapper),
    ...(post.quote ? { quote: mapXPostBase(post.quote, mapper) } : {}),
  }
}
