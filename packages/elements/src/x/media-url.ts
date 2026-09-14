import type { MediaUrlResolver } from '@post-embed/types'

import { getSafeUrl } from '../safe-url.ts'

export function getMediaUrl(
  url: string,
  resolve: MediaUrlResolver | null,
): string | undefined {
  return resolve?.(url) || getSafeUrl(url)
}
