import { registerCustomElement } from '@aria-ui/core'

import { YouTubeVideoCustomElement } from './youtube-video.ts'

export function registerYouTubeVideo(name = 'post-embed-youtube-video'): void {
  registerCustomElement(name, class extends YouTubeVideoCustomElement {})
}
