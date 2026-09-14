import type { XMediaUrlPolicy, MediaRole } from '@post-embed/types'
import { getSafeUrl } from '../safe-url.ts'
export function getMediaUrl(url: string, role: MediaRole, policy: XMediaUrlPolicy | null) {
  return policy ? policy(url, role) : getSafeUrl(url)
}
