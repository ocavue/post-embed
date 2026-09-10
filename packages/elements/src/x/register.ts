import { registerCustomElement } from '@aria-ui/core'

import { XPost } from './x-post.ts'

export function registerXPost(name = 'post-embed-x-post'): void {
  registerCustomElement(name, class extends XPost {})
}
