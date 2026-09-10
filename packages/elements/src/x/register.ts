import { registerCustomElement } from '@aria-ui/core'

import { XPost } from './x-post.ts'

export function registerXPost(): void {
  if (typeof window === 'undefined') return
  registerCustomElement('post-embed-x-post', XPost)
}
