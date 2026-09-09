import * as v from 'valibot'

import { NumberSchema, PairSchema, StringSchema } from './primitives.js'

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
export const PaletteItemSchema = v.object({
  percentage: NumberSchema,
  rgb: RGBSchema,
})
const MediaBaseEntries = {
  display_url: StringSchema,
  expanded_url: StringSchema,
  ext_media_availability: v.object({ status: StringSchema }),
  ext_media_color: v.object({
    palette: v.fallback(v.array(PaletteItemSchema), () => []),
  }),
  indices: PairSchema,
  media_url_https: StringSchema,
  original_info: v.object({
    height: NumberSchema,
    width: NumberSchema,
    focus_rects: v.fallback(v.array(RectSchema), () => []),
  }),
  sizes: v.object({
    large: SizeSchema,
    medium: SizeSchema,
    small: SizeSchema,
    thumb: SizeSchema,
  }),
  url: StringSchema,
}
export const VideoVariantSchema = v.object({
  bitrate: v.optional(NumberSchema),
  content_type: v.fallback(
    v.picklist(['video/mp4', 'application/x-mpegURL']),
    'video/mp4',
  ),
  url: StringSchema,
})
export const VideoInfoSchema = v.object({
  aspect_ratio: PairSchema,
  variants: v.fallback(v.array(VideoVariantSchema), () => []),
})
const MediaPhotoSchema = v.object({
  ...MediaBaseEntries,
  type: v.literal('photo'),
  ext_alt_text: v.optional(StringSchema),
})
const MediaVideoSchema = v.object({
  ...MediaBaseEntries,
  type: v.literal('video'),
  video_info: VideoInfoSchema,
})
const MediaAnimatedGifSchema = v.object({
  ...MediaBaseEntries,
  type: v.literal('animated_gif'),
  video_info: VideoInfoSchema,
})
export const MediaDetailsSchema = v.variant('type', [
  MediaPhotoSchema,
  MediaVideoSchema,
  MediaAnimatedGifSchema,
])
export const TweetPhotoSchema = v.object({
  backgroundColor: RGBSchema,
  cropCandidates: v.fallback(v.array(RectSchema), () => []),
  expandedUrl: StringSchema,
  url: StringSchema,
  width: NumberSchema,
  height: NumberSchema,
})
export const LegacyVideoVariantSchema = v.object({
  type: StringSchema,
  src: StringSchema,
})
export const TweetVideoSchema = v.object({
  aspectRatio: PairSchema,
  contentType: StringSchema,
  durationMs: NumberSchema,
  mediaAvailability: v.object({ status: StringSchema }),
  poster: StringSchema,
  variants: v.fallback(v.array(LegacyVideoVariantSchema), () => []),
  videoId: v.object({ type: StringSchema, id: StringSchema }),
  viewCount: NumberSchema,
})
