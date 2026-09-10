import { registerCustomElement } from '@aria-ui/core'

import { XPost } from './x-post.ts'

// REVIEW: FIXME: let's add registerXPost(name="post-embed-x-post") so that we can register it under a different name for whatever reason.
export function registerXPost(): void {
  // REVIEW: FIXME: we do not need "typeof window === 'undefined'" because we alreayd have it in "registerCustomElement"
  if (typeof window === 'undefined') return
  registerCustomElement('post-embed-x-post', XPost)
}
