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
    return /^\/(?:\w+|i\/web)\/status(?:es)?\/([1-9]\d{0,19})(?:\/(?:photo|video)\/\d+)?\/?$/.exec(
      url.pathname,
    )?.[1]
  } catch {
    return
  }
}
