import type { AppRouter } from '@starter-monorepo/api'
import { createTRPCContext } from '@trpc/tanstack-react-query'

export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>()
