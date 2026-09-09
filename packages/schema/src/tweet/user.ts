// Source: https://github.com/vercel/react-tweet/blob/react-tweet@3.3.1/packages/react-tweet/src/api/types/user.ts

import * as v from 'valibot'

import { IdSchema } from './primitives.js'

export const ProfileImageShapeSchema = v.picklist([
  'Circle',
  'Square',
  'Hexagon',
])
export const UserHighlightedLabelSchema = v.object({
  description: v.optional(v.string()),
  badge: v.optional(v.object({ url: v.string() })),
  url: v.optional(
    v.object({ url: v.string(), url_type: v.literal('DeepLink') }),
  ),
  user_label_type: v.literal('BusinessLabel'),
  user_label_display_type: v.literal('Badge'),
})
export const UserCoreSchema = v.object({
  id_str: IdSchema,
  name: v.string(),
  screen_name: v.string(),
  profile_image_url_https: v.string(),
})
export const TweetUserSchema = v.object({
  ...UserCoreSchema.entries,
  profile_image_shape: ProfileImageShapeSchema,
  verified: v.boolean(),
  verified_type: v.optional(v.picklist(['Business', 'Government'])),
  is_blue_verified: v.boolean(),
  highlighted_label: v.optional(UserHighlightedLabelSchema),
})
export const EnrichedUserSchema = v.object({
  ...TweetUserSchema.entries,
  url: v.string(),
  follow_url: v.string(),
})
