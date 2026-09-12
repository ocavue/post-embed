import * as v from 'valibot'

import {
  BooleanSchema,
  NumberSchema,
  StringSchema,
  looseArray,
} from '../primitives.ts'

export const XPostSegmentSchema = v.variant('type', [
  v.object({ type: v.literal('text'), text: StringSchema }),
  v.object({ type: v.literal('link'), text: StringSchema, url: StringSchema }),
])

export const XPostVideoSourceSchema = v.object({
  url: StringSchema,
  type: v.fallback(
    v.picklist(['video/mp4', 'application/x-mpegURL']),
    'video/mp4',
  ),
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
    sources: looseArray(XPostVideoSourceSchema),
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
  verified: v.fallback(
    v.optional(v.picklist(['blue', 'business', 'government', 'legacy'])),
    undefined,
  ),
  label: v.optional(
    v.object({
      text: StringSchema,
      badge: v.optional(StringSchema),
      url: v.optional(StringSchema),
    }),
  ),
})

export const XPostBaseSchema = v.object({
  id: StringSchema,
  createdAt: StringSchema,
  lang: v.optional(StringSchema),
  author: XPostAuthorSchema,
  body: looseArray(XPostSegmentSchema),
  media: v.optional(looseArray(XPostMediaSchema)),
  edit: v.fallback(v.optional(v.picklist(['edited', 'stale'])), undefined),
  truncated: v.optional(BooleanSchema),
})

export const XPostSchema = v.object({
  ...XPostBaseSchema.entries,
  quote: v.optional(XPostBaseSchema),
  replyTo: v.optional(v.object({ handle: StringSchema, id: StringSchema })),
})
