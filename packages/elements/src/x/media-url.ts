import type { XMediaUrlPolicy } from '@post-embed/types'

import { getSafeUrl } from '../safe-url.ts'

export function getMediaUrl(
  url: string,
  policy: XMediaUrlPolicy | null,
): string | undefined {
  return policy ? policy(url) : getSafeUrl(url)
}
