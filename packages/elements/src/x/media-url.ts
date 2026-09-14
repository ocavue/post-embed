import type { UrlMapper } from '@post-embed/types'

import { getSafeUrl } from '../safe-url.ts'

export function getMediaUrl(
  url: string,
  policy: UrlMapper | null,
): string | undefined {
  return policy ? policy(url) : getSafeUrl(url)
}
