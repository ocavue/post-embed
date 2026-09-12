/**
 * Keys that describe the capturing account's relationship to a post or a
 * user rather than the post itself. Fixtures must not carry them.
 */
export const VIEWER_KEYS: readonly string[] = [
  'relationship_perspectives',
  'bookmarked',
  'favorited',
  'retweeted',
  'dm_permissions',
  'notifications_settings',
  'super_followed_by',
  'super_following',
  'follow_request_sent',
]

/**
 * A deep copy of `value` with every viewer-specific key removed.
 */
export function scrubFixture<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item: unknown) => scrubFixture(item)) as T
  }
  if (typeof value !== 'object' || value === null) return value
  const result: Record<string, unknown> = {}
  for (const [key, item] of Object.entries(value)) {
    if (VIEWER_KEYS.includes(key)) continue
    result[key] = scrubFixture(item)
  }
  return result as T
}

/**
 * Every path at which a viewer-specific key still appears.
 */
export function findViewerKeys(value: unknown, path = ''): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => {
      return findViewerKeys(item, `${path}[${index}]`)
    })
  }
  if (typeof value !== 'object' || value === null) return []
  return Object.entries(value).flatMap(([key, item]) => {
    const childPath = path ? `${path}.${key}` : key
    return VIEWER_KEYS.includes(key)
      ? [childPath]
      : findViewerKeys(item, childPath)
  })
}
