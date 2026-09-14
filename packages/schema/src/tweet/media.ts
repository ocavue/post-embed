import * as v from 'valibot'

import { NumberSchema, StringSchema, looseArray } from '../primitives.ts'

import { IndicesSchema } from './entities.ts'

export const RGBSchema = v.object({
  red: NumberSchema,
  green: NumberSchema,
  blue: NumberSchema,
})

export const RectSchema = v.object({
  x: NumberSchema,
  y: NumberSchema,
  w: NumberSchema,
  h: NumberSchema,
})

export const SizeSchema = v.object({
  h: NumberSchema,
  w: NumberSchema,
  resize: StringSchema,
})

export const VideoInfoSchema = v.object({
  aspect_ratio: v.fallback(
    v.tuple([NumberSchema, NumberSchema]),
    () => [1, 1] satisfies [number, number],
  ),
  variants: looseArray(
    v.object({
      bitrate: v.optional(NumberSchema),
      content_type: v.fallback(
        v.picklist(['video/mp4', 'application/x-mpegURL']),
        'video/mp4',
      ),
      url: StringSchema,
    }),
  ),
})

const MediaBaseSchema = v.object({
  display_url: StringSchema,
  expanded_url: StringSchema,
  ext_media_availability: v.object({ status: StringSchema }),
  ext_media_color: v.fallback(
    v.object({
      palette: looseArray(
        v.object({
          percentage: NumberSchema,
          rgb: RGBSchema,
        }),
      ),
    }),
    () => ({ palette: [] }),
  ),
  indices: IndicesSchema,
  media_url_https: StringSchema,
  original_info: v.object({
    height: NumberSchema,
    width: NumberSchema,
    focus_rects: looseArray(RectSchema),
  }),
  sizes: v.object({
    large: SizeSchema,
    medium: SizeSchema,
    small: SizeSchema,
    thumb: SizeSchema,
  }),
  url: StringSchema,
})

export const MediaPhotoSchema = v.object({
  ...MediaBaseSchema.entries,
  type: v.literal('photo'),
  ext_alt_text: v.optional(StringSchema),
})

export const MediaAnimatedGifSchema = v.object({
  ...MediaBaseSchema.entries,
  type: v.literal('animated_gif'),
  video_info: VideoInfoSchema,
})

export const MediaVideoSchema = v.object({
  ...MediaBaseSchema.entries,
  type: v.literal('video'),
  video_info: VideoInfoSchema,
})

export const MediaDetailsSchema = v.variant('type', [
  MediaPhotoSchema,
  MediaAnimatedGifSchema,
  MediaVideoSchema,
])
