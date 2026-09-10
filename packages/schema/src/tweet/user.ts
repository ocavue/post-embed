import * as v from 'valibot'

import { StringSchema } from '../primitives.ts'

export const HighlightedBadgeSchema = v.object({
  url: StringSchema,
})

export const UserHighlightedLabelSchema = v.object({
  description: v.optional(StringSchema),
  badge: v.optional(HighlightedBadgeSchema),
  url: v.optional(
    v.object({
      url: StringSchema,
      url_type: v.fallback(v.literal('DeepLink'), 'DeepLink'),
    }),
  ),
  user_label_type: v.fallback(v.literal('BusinessLabel'), 'BusinessLabel'),
  user_label_display_type: v.fallback(v.literal('Badge'), 'Badge'),
})

export const TweetUserSchema = v.object({
  id_str: StringSchema,
  name: StringSchema,
  profile_image_url_https: StringSchema,
  profile_image_shape: v.fallback(
    v.picklist(['Circle', 'Square', 'Hexagon']),
    'Circle',
  ),
  screen_name: StringSchema,
  verified: v.fallback(v.boolean(), false),
  verified_type: v.fallback(
    v.optional(v.picklist(['Business', 'Government'])),
    undefined,
  ),
  is_blue_verified: v.fallback(v.boolean(), false),
  highlighted_label: v.optional(UserHighlightedLabelSchema),
})
