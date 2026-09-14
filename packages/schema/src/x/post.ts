import * as v from 'valibot'

import {
  BooleanSchema,
  NumberSchema,
  StringSchema,
  looseItems,
} from '../primitives.ts'

export const XPostSegmentSchema = v.variant('type', [
  v.looseObject({ type: v.literal('text'), text: StringSchema }),
  v.looseObject({ type: v.literal('link'), text: StringSchema, url: StringSchema }),
])

export const XPostVideoSourceSchema = v.looseObject({
  url: StringSchema,
  type: v.picklist(['video/mp4', 'application/x-mpegURL']),
  bitrate: v.optional(NumberSchema),
})

export const XPostMediaSchema = v.variant('type', [
  v.looseObject({
    type: v.literal('photo'),
    url: StringSchema,
    width: NumberSchema,
    height: NumberSchema,
    alt: v.optional(StringSchema),
    unavailable: v.optional(BooleanSchema),
  }),
  v.looseObject({
    type: v.picklist(['video', 'gif']),
    poster: v.optional(StringSchema),
    width: NumberSchema,
    height: NumberSchema,
    sources: looseItems(XPostVideoSourceSchema),
    unavailable: v.optional(BooleanSchema),
  }),
])

export const XPostAuthorSchema = v.looseObject({
  name: StringSchema,
  handle: StringSchema,
  avatar: v.optional(StringSchema),
  avatarShape: v.fallback(
    v.optional(v.picklist(['square', 'hexagon'])),
    undefined,
  ),
})

export const XPostBaseSchema = v.looseObject({
  id: v.pipe(v.string(), v.regex(/^[1-9]\d{0,19}$/)),
  createdAt: StringSchema,
  lang: v.optional(StringSchema),
  author: XPostAuthorSchema,
  body: looseItems(XPostSegmentSchema),
  media: v.optional(looseItems(XPostMediaSchema)),
  edit: v.fallback(v.optional(v.picklist(['edited', 'stale'])), undefined),
  truncated: v.optional(BooleanSchema),
})

export const XPostSchema = v.looseObject({
  ...XPostBaseSchema.entries,
  quote: v.optional(v.fallback(XPostBaseSchema, undefined)),
  replyTo: v.optional(v.looseObject({ handle: StringSchema, id: v.pipe(v.string(), v.regex(/^[1-9]\d{0,19}$/)) })),
})
