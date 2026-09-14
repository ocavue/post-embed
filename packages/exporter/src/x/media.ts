import type { XPostVideoSource } from '@post-embed/types'
// FIXME: (1) the https/username/password check is new and duplicates `getSafeUrl` at render time
// plus reflect's archive validation; the two `toSource`s it replaced validated nothing and nothing
// needed it. (2) Passing arbitrary MIME types through (`: label`) widened `XPostVideoSource.type`
// from a picklist to `string`, which in turn forced `createArchivedPost`/`parseArchivedPost` in
// reflect to filter by string compare. X only serves `video/mp4` and HLS; keep the picklist and
// drop the webm test.
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
        : label
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
