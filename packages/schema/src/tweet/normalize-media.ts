import * as v from 'valibot'

import {
  LegacyVideoVariantSchema,
  PaletteItemSchema,
  RectSchema,
  VideoVariantSchema,
} from './media.js'
import { DimensionSchema, NonNegativeSchema } from './primitives.js'
import {
  at,
  defaultProperty,
  isRecord,
  recordRepair,
  repairList,
  repairOptional,
  type RepairContext,
} from './repair.js'

function normalizeVariant(input: unknown, context: RepairContext) {
  if (!isRecord(input)) return input
  const candidate = { ...input }
  repairOptional(candidate, 'bitrate', NonNegativeSchema, context)
  return candidate
}

export function normalizeMedia(input: unknown, context: RepairContext) {
  if (!isRecord(input)) return input
  const candidate = { ...input }
  if (isRecord(candidate.original_info)) {
    candidate.original_info = {
      ...candidate.original_info,
      focus_rects: repairList(
        candidate.original_info.focus_rects,
        RectSchema,
        at(at(context, 'original_info'), 'focus_rects'),
      ),
    }
  }
  defaultProperty(candidate, 'ext_media_color', {}, context, true)
  if (isRecord(candidate.ext_media_color)) {
    candidate.ext_media_color = {
      ...candidate.ext_media_color,
      palette: repairList(
        candidate.ext_media_color.palette,
        PaletteItemSchema,
        at(at(context, 'ext_media_color'), 'palette'),
      ),
    }
  }
  if (candidate.type === 'photo')
    repairOptional(candidate, 'ext_alt_text', v.string(), context)
  if (candidate.type === 'video' || candidate.type === 'animated_gif') {
    defaultProperty(candidate, 'video_info', {}, context, true)
    if (isRecord(candidate.video_info)) {
      const info = { ...candidate.video_info }
      const infoContext = at(context, 'video_info')
      if (info.aspect_ratio == null) {
        const dimensions = v.safeParse(
          v.object({ width: DimensionSchema, height: DimensionSchema }),
          candidate.original_info,
        )
        if (dimensions.success) {
          info.aspect_ratio = [
            dimensions.output.width,
            dimensions.output.height,
          ]
          recordRepair(at(infoContext, 'aspect_ratio'), 'derived')
        }
      }
      info.variants = repairList(
        info.variants,
        VideoVariantSchema,
        at(infoContext, 'variants'),
        normalizeVariant,
      )
      candidate.video_info = info
    }
  }
  return candidate
}

export function normalizePhoto(input: unknown, context: RepairContext) {
  if (!isRecord(input)) return input
  return {
    ...input,
    cropCandidates: repairList(
      input.cropCandidates,
      RectSchema,
      at(context, 'cropCandidates'),
    ),
  }
}

export function normalizeLegacyVideo(input: unknown, context: RepairContext) {
  if (!isRecord(input)) return input
  return {
    ...input,
    variants: repairList(
      input.variants,
      LegacyVideoVariantSchema,
      at(context, 'variants'),
    ),
  }
}
