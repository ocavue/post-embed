import * as v from 'valibot'

export const TweetEditControlSchema = v.object({
  edit_tweet_ids: v.fallback(v.array(v.fallback(v.string(), '')), () => []),
  editable_until_msecs: v.fallback(v.string(), ''),
  is_edit_eligible: v.fallback(v.boolean(), false),
  edits_remaining: v.fallback(v.string(), ''),
})
