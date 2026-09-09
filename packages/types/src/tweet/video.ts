// Source: https://github.com/vercel/react-tweet/blob/react-tweet@3.3.1/packages/react-tweet/src/api/types/video.ts

export interface TweetVideo {
  aspectRatio: [number, number]
  contentType: string
  durationMs: number
  mediaAvailability: {
    status: string
  }
  poster: string
  variants: {
    type: string
    src: string
  }[]
  videoId: {
    type: string
    id: string
  }
  viewCount: number
}
