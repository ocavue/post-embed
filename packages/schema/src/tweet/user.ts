// Source: https://github.com/vercel/react-tweet/blob/react-tweet@3.3.1/packages/react-tweet/src/api/types/user.ts

import * as v from 'valibot'

import { BooleanSchema, StringSchema, object } from './primitives.js'

const ProfileImageShapeSchema = v.fallback(
  v.picklist(['Circle', 'Square', 'Hexagon']),
  'Circle',
)
export const UserHighlightedLabelSchema = object({
  description: v.optional(StringSchema),
  badge: v.optional(object({ url: StringSchema })),
  url: v.optional(
    object({
      url: StringSchema,
      url_type: v.fallback(v.literal('DeepLink'), 'DeepLink'),
    }),
  ),
  user_label_type: v.fallback(v.literal('BusinessLabel'), 'BusinessLabel'),
  user_label_display_type: v.fallback(v.literal('Badge'), 'Badge'),
})
export const TweetUserSchema = object({
  id_str: StringSchema,
  name: StringSchema,
  screen_name: StringSchema,
  profile_image_url_https: StringSchema,

  profile_image_shape: ProfileImageShapeSchema,
  verified: BooleanSchema,
  verified_type: v.fallback(
    v.optional(v.picklist(['Business', 'Government'])),
    undefined,
  ),
  is_blue_verified: BooleanSchema,
  highlighted_label: v.optional(UserHighlightedLabelSchema),
})
