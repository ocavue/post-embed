import { z } from 'zod'

import { db } from '../db'
import { publicProcedure, router } from '../trpc'

export const postRouter = router({
  list: publicProcedure.query(async () => {
    const posts = await db.post.findMany()
    return posts
  }),
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async (options) => {
      const { input } = options
      const post = await db.post.findById(input.id)
      return post
    }),
  create: publicProcedure
    .input(z.object({ title: z.string() }))
    .mutation(async (options) => {
      const { input } = options
      const post = await db.post.create(input)
      return post
    }),
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async (options) => {
      const { input } = options
      const success = await db.post.delete(input.id)
      return success
    }),
})
