import { postRouter } from './routers/post'
import { userRouter } from './routers/user'
import { router } from './trpc'

export type { Post, User } from './types'

export const appRouter = router({
  user: userRouter,
  post: postRouter,
})

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter
