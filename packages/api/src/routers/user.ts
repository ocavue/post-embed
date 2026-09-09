import { z } from 'zod'

import { db } from '../db'
import { publicProcedure, router } from '../trpc'

export const userRouter = router({
  list: publicProcedure.query(async () => {
    const users = await db.user.findMany()
    return users
  }),
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async (options) => {
      const { input } = options
      const user = await db.user.findById(input.id)
      return user
    }),
  create: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async (options) => {
      const { input } = options
      const user = await db.user.create(input)
      return user
    }),
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async (options) => {
      const { input } = options
      const success = await db.user.delete(input.id)
      return success
    }),
})
