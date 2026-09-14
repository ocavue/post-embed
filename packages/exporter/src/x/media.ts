import type { XPostVideoSource } from '@post-embed/types'
export function toSource(
  url: string,
  mime: string,
  bitrate?: number,
): XPostVideoSource | undefined {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return
  }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) return
  const label = mime.split(';')[0]?.trim().toLowerCase()
  const type =
    label === 'video/mp4'
      ? 'video/mp4'
      : label === 'application/x-mpegurl' ||
          label === 'application/vnd.apple.mpegurl'
        ? 'application/x-mpegURL'
        : undefined
  if (!type) return
  return {
    url,
    type,
    ...(type === 'video/mp4' &&
    typeof bitrate === 'number' &&
    Number.isFinite(bitrate) &&
    bitrate >= 0
      ? { bitrate }
      : {}),
  }
}
