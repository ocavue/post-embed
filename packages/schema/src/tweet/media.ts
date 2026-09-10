import * as v from 'valibot'

import { IndicesSchema } from './entities.ts'
import { NumberSchema } from '../primitives.ts'

export const RGBSchema = v.object({
  red: v.fallback(v.pipe(v.number(), v.finite()), 0),
  green: v.fallback(v.pipe(v.number(), v.finite()), 0),
  blue: v.fallback(v.pipe(v.number(), v.finite()), 0),
})

export const RectSchema = v.object({
  x: v.fallback(v.pipe(v.number(), v.finite()), 0),
  y: v.fallback(v.pipe(v.number(), v.finite()), 0),
  w: v.fallback(v.pipe(v.number(), v.finite()), 0),
  h: v.fallback(v.pipe(v.number(), v.finite()), 0),
})

export const SizeSchema = v.object({
  h: v.fallback(v.pipe(v.number(), v.finite()), 0),
  w: v.fallback(v.pipe(v.number(), v.finite()), 0),
  resize: v.fallback(v.string(), ''),
})

export const VideoInfoSchema = v.object({
  // FIXME: for [number, number] tuple, just use the following pattern. It is simpler. Notice that the fallback value might
  // be different for different use cases. for aspect_ratio, [0,0] is not a good fallback value, so we use [1,1] instead. For other cases, you might want to use [0,0] as the fallback value.
  aspect_ratio: v.fallback(
    v.tuple([NumberSchema, NumberSchema]),
    () => ([1, 1] satisfies [number, number]),
  ),
  variants: v.fallback(
    v.array(
      v.object({
        bitrate: v.optional(v.fallback(v.pipe(v.number(), v.finite()), 0)),
        content_type: v.fallback(
          v.picklist(['video/mp4', 'application/x-mpegURL']),
          'video/mp4',
        ),
        url: v.fallback(v.string(), ''),
      }),
    ),
    () => [],
  ),
})

const MediaBaseSchema = v.object({
  display_url: v.fallback(v.string(), ''),
  expanded_url: v.fallback(v.string(), ''),
  ext_media_availability: v.object({ status: v.fallback(v.string(), '') }),
  ext_media_color: v.object({
    palette: v.fallback(
      v.array(
        v.object({
          percentage: v.fallback(v.pipe(v.number(), v.finite()), 0),
          rgb: RGBSchema,
        }),
      ),
      () => [],
    ),
  }),
  indices: IndicesSchema,
  media_url_https: v.fallback(v.string(), ''),
  original_info: v.object({
    height: v.fallback(v.pipe(v.number(), v.finite()), 0),
    width: v.fallback(v.pipe(v.number(), v.finite()), 0),
    focus_rects: v.fallback(v.array(RectSchema), () => []),
  }),
  sizes: v.object({
    large: SizeSchema,
    medium: SizeSchema,
    small: SizeSchema,
    thumb: SizeSchema,
  }),
  url: v.fallback(v.string(), ''),
})

export const MediaPhotoSchema = v.object({
  ...MediaBaseSchema.entries,
  type: v.literal('photo'),
  ext_alt_text: v.optional(v.fallback(v.string(), '')),
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
