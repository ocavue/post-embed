import type { ObservedResponse, XTweetEntry } from '@post-embed/exporter/x'

/**
 * Channel for the devtools-only raw response buffer, separate from the package bridge.
 */
export const DEVTOOLS_CHANNEL = 'post-embed-x-exporter-devtools'

export const ENTRY_LIMIT = 200
export const RESPONSE_LIMIT = 20

export type PopupMessage =
  | { type: 'x-exporter:lookup'; postId: string }
  | { type: 'x-exporter:responses' }

export type ContentMessage = { type: 'x-exporter:captured'; entry: XTweetEntry }

export type StoredEntries = Record<string, XTweetEntry>

export type RawResponse = Pick<
  ObservedResponse,
  'url' | 'operation' | 'transport' | 'body'
>
