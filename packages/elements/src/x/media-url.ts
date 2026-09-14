import type { MediaUrlResolver } from '@post-embed/types'

import { getSafeUrl } from '../safe-url.ts'

// FIXME: `MediaUrlResolver` is only ever used as a yes/no gate: the host returns the input URL or
// undefined (see reflect `XPostHost.resolveXPostMediaUrl`, which keeps a per-post allowlist just to
// answer that). Yet it is a function threaded through
// renderAuthor/renderMedia/renderPost/renderQuoted, the element props, and three meowdown layers. A
// plain `mediaUrlProtocols?: string[]` prop consumed inside `getSafeUrl` (accept e.g.
// `reflect-asset:` besides http/https) removes the function plumbing on all three sides and the
// allowlist bookkeeping in the host.
export function getMediaUrl(
  url: string,
  resolve: MediaUrlResolver | null,
): string | undefined {
  return resolve?.(url) || getSafeUrl(url)
}
