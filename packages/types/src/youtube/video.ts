// Fields after `url` follow https://www.youtube.com/oembed field names.

export interface YouTubeVideo {
  url: string
  title: string
  author_name: string
  author_url: string
  thumbnail_url: string
  thumbnail_width: number
  thumbnail_height: number
  width: number
  height: number
}
