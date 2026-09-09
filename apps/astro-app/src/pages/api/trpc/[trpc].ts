import { appRouter } from '@starter-monorepo/api'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import type { APIRoute } from 'astro'

export const prerender = false

export const ALL: APIRoute = (options) => {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req: options.request,
    router: appRouter,
    createContext: () => ({}),
  })
}
