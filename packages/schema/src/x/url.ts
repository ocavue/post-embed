import * as v from 'valibot'
export const X_POST_ID_PATTERN = /^[1-9]\d{0,19}$/

export const XPostIdSchema = v.pipe(v.string(), v.regex(X_POST_ID_PATTERN))

export function parseXPostId(value: string): string | undefined {
  try {
    const url = new URL(value)
    if (
      url.protocol !== 'https:' ||
      url.port ||
      url.username ||
      url.password ||
      !/^(?:www\.|mobile\.)?(?:x\.com|twitter\.com)$/i.test(url.hostname)
    )
      return
    const id =
      /^\/(?:\w+|i\/web)\/status(?:es)?\/(\d+)(?:\/(?:photo|video)\/\d+)?\/?$/.exec(
        url.pathname,
      )?.[1]
    return id && X_POST_ID_PATTERN.test(id) ? id : undefined
  } catch {
    return
  }
}
