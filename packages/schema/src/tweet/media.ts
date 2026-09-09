// Source: https://github.com/vercel/react-tweet/blob/react-tweet@3.3.1/packages/react-tweet/src/api/types/media.ts
// Source: https://github.com/vercel/react-tweet/blob/react-tweet@3.3.1/packages/react-tweet/src/api/types/photo.ts
// Source: https://github.com/vercel/react-tweet/blob/react-tweet@3.3.1/packages/react-tweet/src/api/types/video.ts

import * as v from 'valibot'

import {
  CountSchema,
  DimensionSchema,
  IndicesSchema,
  NonNegativeSchema,
  NumberSchema,
  RatioSchema,
} from './primitives.js'

const ColorChannelSchema = v.pipe(CountSchema, v.maxValue(255))
export const RGBSchema = v.object({
  red: ColorChannelSchema,
  green: ColorChannelSchema,
  blue: ColorChannelSchema,
})
export const RectSchema = v.object({
  x: NumberSchema,
  y: NumberSchema,
  w: NonNegativeSchema,
  h: NonNegativeSchema,
})
export const SizeSchema = v.object({
  h: DimensionSchema,
  w: DimensionSchema,
  resize: v.string(),
})
export const PaletteItemSchema = v.object({
  percentage: NonNegativeSchema,
  rgb: RGBSchema,
})
export const MediaBaseSchema = v.object({
  display_url: v.string(),
  expanded_url: v.string(),
  ext_media_availability: v.object({ status: v.string() }),
  ext_media_color: v.object({ palette: v.array(PaletteItemSchema) }),
  indices: IndicesSchema,
  media_url_https: v.string(),
  original_info: v.object({
    height: DimensionSchema,
    width: DimensionSchema,
    focus_rects: v.array(RectSchema),
  }),
  sizes: v.object({
    large: SizeSchema,
    medium: SizeSchema,
    small: SizeSchema,
    thumb: SizeSchema,
  }),
  url: v.string(),
})
export const VideoVariantSchema = v.object({
  bitrate: v.optional(NonNegativeSchema),
  content_type: v.picklist(['video/mp4', 'application/x-mpegURL']),
  url: v.string(),
})
export const VideoInfoSchema = v.object({
  aspect_ratio: RatioSchema,
  variants: v.array(VideoVariantSchema),
})
export const MediaPhotoSchema = v.object({
  ...MediaBaseSchema.entries,
  type: v.literal('photo'),
  ext_alt_text: v.optional(v.string()),
})
export const MediaVideoSchema = v.object({
  ...MediaBaseSchema.entries,
  type: v.literal('video'),
  video_info: VideoInfoSchema,
})
export const MediaAnimatedGifSchema = v.object({
  ...MediaBaseSchema.entries,
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
  cropCandidates: v.array(RectSchema),
  expandedUrl: v.string(),
  url: v.string(),
  width: DimensionSchema,
  height: DimensionSchema,
})
export const LegacyVideoVariantSchema = v.object({
  type: v.string(),
  src: v.string(),
})
export const TweetVideoSchema = v.object({
  aspectRatio: RatioSchema,
  contentType: v.string(),
  durationMs: NonNegativeSchema,
  mediaAvailability: v.object({ status: v.string() }),
  poster: v.string(),
  variants: v.array(LegacyVideoVariantSchema),
  videoId: v.object({ type: v.string(), id: v.string() }),
  viewCount: CountSchema,
})
