import * as v from 'valibot'

import { StringSchema, looseArray } from '../primitives.ts'

export const TweetEditControlSchema = v.object({
  edit_tweet_ids: looseArray(StringSchema),
  editable_until_msecs: StringSchema,
  is_edit_eligible: v.fallback(v.boolean(), false),
  edits_remaining: StringSchema,
})
