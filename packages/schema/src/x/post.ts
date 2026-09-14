import type { XPost } from '@post-embed/types'
import type { StandardSchemaV1 } from '@standard-schema/spec'
import * as v from 'valibot'

import {
  BooleanSchema,
  NumberSchema,
  StringSchema,
  looseItems,
} from '../primitives.ts'

import { XPostIdSchema } from './url.ts'

export const XPostSegmentSchema = v.variant('type', [
  v.object({ type: v.literal('text'), text: StringSchema }),
  v.object({
    type: v.literal('link'),
    text: StringSchema,
    url: StringSchema,
  }),
])

export const XPostVideoSourceSchema = v.object({
  url: StringSchema,
  type: v.picklist(['video/mp4', 'application/x-mpegURL']),
  bitrate: v.optional(NumberSchema),
})

export const XPostMediaSchema = v.variant('type', [
  v.object({
    type: v.literal('photo'),
    url: StringSchema,
    width: NumberSchema,
    height: NumberSchema,
    alt: v.optional(StringSchema),
    unavailable: v.optional(BooleanSchema),
  }),
  v.object({
    type: v.picklist(['video', 'gif']),
    poster: v.optional(StringSchema),
    width: NumberSchema,
    height: NumberSchema,
    sources: looseItems(XPostVideoSourceSchema),
    unavailable: v.optional(BooleanSchema),
  }),
])

export const XPostAuthorSchema = v.object({
  name: StringSchema,
  handle: StringSchema,
  avatar: v.optional(StringSchema),
  avatarShape: v.fallback(
    v.optional(v.picklist(['square', 'hexagon'])),
    undefined,
  ),
})

export const XPostBaseSchema = v.object({
  id: XPostIdSchema,
  createdAt: StringSchema,
  lang: v.optional(StringSchema),
  author: XPostAuthorSchema,
  body: looseItems(XPostSegmentSchema),
  media: v.optional(looseItems(XPostMediaSchema)),
  edit: v.fallback(v.optional(v.picklist(['edited', 'stale'])), undefined),
  truncated: v.optional(BooleanSchema),
})

export const XPostSchema = v.object({
  ...XPostBaseSchema.entries,
  quote: v.fallback(v.optional(XPostBaseSchema), undefined),
  replyTo: v.optional(
    v.object({
      handle: StringSchema,
      id: XPostIdSchema,
    }),
  ),
})

/**
 * Validates a snapshot synchronously, returning its value or validation issues.
 */
export function parseXPost(input: unknown): StandardSchemaV1.Result<XPost> {
  const result = XPostSchema['~standard'].validate(input)
  if (result instanceof Promise) {
    throw new TypeError('XPostSchema must be synchronous')
  }
  return result
}
