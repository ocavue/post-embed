import * as v from 'valibot'

export const HighlightedBadgeSchema = v.object({
  url: v.fallback(v.string(), ''),
})

export const UserHighlightedLabelSchema = v.object({
  description: v.optional(v.fallback(v.string(), '')),
  badge: v.optional(HighlightedBadgeSchema),
  url: v.optional(
    v.object({
      url: v.fallback(v.string(), ''),
      url_type: v.fallback(v.literal('DeepLink'), 'DeepLink'),
    }),
  ),
  user_label_type: v.fallback(v.literal('BusinessLabel'), 'BusinessLabel'),
  user_label_display_type: v.fallback(v.literal('Badge'), 'Badge'),
})

export const TweetUserSchema = v.object({
  id_str: v.fallback(v.string(), ''),
  name: v.fallback(v.string(), ''),
  profile_image_url_https: v.fallback(v.string(), ''),
  profile_image_shape: v.fallback(
    v.picklist(['Circle', 'Square', 'Hexagon']),
    'Circle',
  ),
  screen_name: v.fallback(v.string(), ''),
  verified: v.fallback(v.boolean(), false),
  verified_type: v.fallback(
    v.optional(v.picklist(['Business', 'Government'])),
    undefined,
  ),
  is_blue_verified: v.fallback(v.boolean(), false),
  highlighted_label: v.optional(UserHighlightedLabelSchema),
})
