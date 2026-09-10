import type { XPostElement } from './x-post.ts'

export { registerXPost } from './register.ts'
export type { XPostElement } from './x-post.ts'

declare global {
  interface HTMLElementTagNameMap {
    'post-embed-x-post': XPostElement
  }
}
