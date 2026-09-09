// Source: https://github.com/vercel/react-tweet/blob/react-tweet@3.3.1/packages/react-tweet/src/utils.ts

import * as v from 'valibot'

import { EntitySchema, rawEntitySchemas } from './entities.js'
import {
  MediaDetailsSchema,
  TweetPhotoSchema,
  TweetVideoSchema,
} from './media.js'
import {
  normalizeLegacyVideo,
  normalizeMedia,
  normalizePhoto,
} from './normalize-media.js'
import { IdSchema, IndicesSchema } from './primitives.js'
import {
  at,
  defaultProperty,
  isRecord,
  parseKnown,
  recordRepair,
  repairList,
  repairOptional,
  type RepairContext,
} from './repair.js'
import {
  CoreSchema,
  EnrichedQuotedTweetSchema,
  QuotedTweetSchema,
  TweetBaseSchema,
  TweetParentSchema,
} from './tweet.js'
import {
  ProfileImageShapeSchema,
  TweetUserSchema,
  UserHighlightedLabelSchema,
} from './user.js'

type TweetKind = 'tweet' | 'quote' | 'parent'

function deriveString(
  object: Record<string, unknown>,
  key: string,
  value: string,
  context: RepairContext,
) {
  if (typeof object[key] !== 'string') {
    object[key] = value
    recordRepair(at(context, key), 'derived')
  }
}

function normalizeUser(input: Record<string, unknown>, context: RepairContext) {
  const candidate = { ...input }
  defaultProperty(candidate, 'verified', false, context)
  defaultProperty(candidate, 'is_blue_verified', false, context)
  if (
    !v.safeParse(ProfileImageShapeSchema, candidate.profile_image_shape).success
  ) {
    const previous = candidate.profile_image_shape
    candidate.profile_image_shape = 'Circle'
    recordRepair(
      at(context, 'profile_image_shape'),
      previous === undefined
        ? 'defaulted-missing'
        : previous === null
          ? 'defaulted-null'
          : 'defaulted-invalid',
    )
  }
  repairOptional(
    candidate,
    'verified_type',
    TweetUserSchema.entries.verified_type,
    context,
  )
  repairOptional(
    candidate,
    'highlighted_label',
    UserHighlightedLabelSchema,
    context,
  )
  return candidate
}

export function normalizeTweet(
  input: unknown,
  context: RepairContext,
  kind: TweetKind = 'tweet',
  enriched = false,
): unknown {
  const core = v.safeParse(CoreSchema, input)
  if (!core.success || !isRecord(input) || !isRecord(input.user)) return input
  const candidate = { ...input }
  const textLength = Array.from(core.output.text).length
  if (candidate.display_text_range == null) {
    candidate.display_text_range = [0, textLength]
    recordRepair(at(context, 'display_text_range'), 'derived')
  }
  const range = v.safeParse(
    v.pipe(
      IndicesSchema,
      v.check(
        (indices) => indices[1] <= textLength,
        'Range exceeds text length',
      ),
    ),
    candidate.display_text_range,
  )
  // Preserve invalid ranges for the final validation, including out-of-bounds ranges.
  if (!range.success) return candidate
  candidate.user = normalizeUser(input.user, at(context, 'user'))
  defaultProperty(candidate, 'lang', 'und', context)
  defaultProperty(candidate, 'isEdited', false, context)
  defaultProperty(candidate, 'isStaleEdit', false, context)
  defaultProperty(candidate, 'favorite_count', 0, context)
  if (kind === 'tweet') {
    defaultProperty(candidate, '__typename', 'Tweet', context)
    defaultProperty(candidate, 'news_action_type', 'conversation', context)
    defaultProperty(candidate, 'conversation_count', 0, context)
  } else {
    defaultProperty(candidate, 'reply_count', 0, context)
    defaultProperty(candidate, 'retweet_count', 0, context)
  }
  defaultProperty(candidate, 'edit_control', {}, context, true)
  if (isRecord(candidate.edit_control)) {
    const edit = { ...candidate.edit_control }
    const editContext = at(context, 'edit_control')
    defaultProperty(
      edit,
      'edit_tweet_ids',
      [core.output.id_str],
      editContext,
      true,
    )
    defaultProperty(edit, 'editable_until_msecs', '0', editContext)
    defaultProperty(edit, 'is_edit_eligible', false, editContext)
    defaultProperty(edit, 'edits_remaining', '0', editContext)
    candidate.edit_control = edit
  }
  repairOptional(
    candidate,
    'note_tweet',
    TweetBaseSchema.entries.note_tweet,
    context,
  )
  if (enriched) {
    const entities = parseKnown(
      v.array(
        v.pipe(
          EntitySchema,
          v.check((entity) => entity.indices[1] <= textLength),
        ),
      ),
      candidate.entities,
      at(context, 'entities'),
    )
    if (entities.success) candidate.entities = entities.output
    else {
      const [start, end] = range.output
      candidate.entities =
        start === end
          ? []
          : [
              {
                type: 'text',
                text: Array.from(core.output.text).slice(start, end).join(''),
                indices: [start, end],
              },
            ]
      recordRepair(at(context, 'entities'), 'derived')
    }
    deriveString(
      candidate,
      'url',
      `https://x.com/${core.output.user.screen_name}/status/${core.output.id_str}`,
      context,
    )
    if (kind === 'tweet' && isRecord(candidate.user)) {
      deriveString(
        candidate.user,
        'url',
        `https://x.com/${core.output.user.screen_name}`,
        at(context, 'user'),
      )
      deriveString(
        candidate.user,
        'follow_url',
        `https://x.com/intent/follow?screen_name=${core.output.user.screen_name}`,
        at(context, 'user'),
      )
      deriveString(
        candidate,
        'like_url',
        `https://x.com/intent/like?tweet_id=${core.output.id_str}`,
        context,
      )
      deriveString(
        candidate,
        'reply_url',
        `https://x.com/intent/tweet?in_reply_to=${core.output.id_str}`,
        context,
      )
    }
  } else {
    defaultProperty(candidate, 'entities', {}, context, true)
    if (isRecord(candidate.entities)) {
      const entities = { ...candidate.entities }
      for (const [key, schema] of Object.entries(rawEntitySchemas)) {
        entities[key] = repairList(
          entities[key],
          v.pipe(
            schema,
            v.check((entity) => entity.indices[1] <= textLength),
          ),
          at(at(context, 'entities'), key),
        )
      }
      candidate.entities = entities
    }
  }
  if (kind !== 'parent')
    candidate.mediaDetails = repairList(
      candidate.mediaDetails,
      MediaDetailsSchema,
      at(context, 'mediaDetails'),
      normalizeMedia,
    )
  if (kind === 'tweet') {
    candidate.photos = repairList(
      candidate.photos,
      TweetPhotoSchema,
      at(context, 'photos'),
      normalizePhoto,
    )
    repairOptional(
      candidate,
      'video',
      TweetVideoSchema,
      context,
      normalizeLegacyVideo,
    )
    repairOptional(candidate, 'possibly_sensitive', v.boolean(), context)
    repairOptional(candidate, 'in_reply_to_screen_name', v.string(), context)
    repairOptional(candidate, 'in_reply_to_status_id_str', IdSchema, context)
    repairOptional(candidate, 'in_reply_to_user_id_str', IdSchema, context)
    if (enriched) {
      if (
        typeof candidate.in_reply_to_screen_name === 'string' &&
        typeof candidate.in_reply_to_status_id_str === 'string'
      ) {
        deriveString(
          candidate,
          'in_reply_to_url',
          `https://x.com/${candidate.in_reply_to_screen_name}/status/${candidate.in_reply_to_status_id_str}`,
          context,
        )
      } else repairOptional(candidate, 'in_reply_to_url', v.string(), context)
    }
    repairOptional(
      candidate,
      'parent',
      TweetParentSchema,
      context,
      (value, child) => normalizeTweet(value, child, 'parent'),
    )
    repairOptional(
      candidate,
      'quoted_tweet',
      enriched ? EnrichedQuotedTweetSchema : QuotedTweetSchema,
      context,
      (value, child) => normalizeTweet(value, child, 'quote', enriched),
    )
  }
  return candidate
}
