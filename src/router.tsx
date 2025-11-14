import { createRouter } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
import { routerWithQueryClient } from '@tanstack/react-router-with-query'
import { ConvexQueryClient } from '@convex-dev/react-query'
import { ConvexProvider, useConvex } from 'convex/react'
import { ConvexAuthProvider } from '@convex-dev/auth/react'
import { AutumnProvider } from 'autumn-js/react'
import { ChakraProvider } from '@chakra-ui/react'
import { api } from '../convex/_generated/api'
import { routeTree } from './routeTree.gen'
import { system } from './theme'

// Wrapper component to provide Autumn with Convex context
function AutumnWrapper({ children }: { children: React.ReactNode }) {
  const convex = useConvex()

  return (
    <AutumnProvider convex={convex} convexApi={(api as any).autumn}>
      {children}
    </AutumnProvider>
  )
}

// Initialize Sentry on client-side
if (typeof window !== 'undefined') {
  import('./sentry.client.config')
}

// Initialize Sentry on server-side
if (typeof window === 'undefined') {
  import('./sentry.server.config')
}

export function getRouter() {
  const CONVEX_URL = (import.meta as any).env.VITE_CONVEX_URL!
  if (!CONVEX_URL) {
    console.error('missing envar CONVEX_URL')
  }
  const convexQueryClient = new ConvexQueryClient(CONVEX_URL)

  const queryClient: QueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
        gcTime: 5000,
      },
    },
  })
  convexQueryClient.connect(queryClient)

  const router = routerWithQueryClient(
    createRouter({
      routeTree,
      defaultPreload: 'intent',
      context: { queryClient },
      scrollRestoration: true,
      defaultPreloadStaleTime: 0, // Let React Query handle all caching
      defaultErrorComponent: (err) => <p>{err.error.stack}</p>,
      defaultNotFoundComponent: () => <p>not found</p>,
      Wrap: ({ children }) => (
        <ConvexProvider client={convexQueryClient.convexClient}>
          <ConvexAuthProvider client={convexQueryClient.convexClient}>
            <AutumnWrapper>
              <ChakraProvider value={system}>{children}</ChakraProvider>
            </AutumnWrapper>
          </ConvexAuthProvider>
        </ConvexProvider>
      ),
    }),
    queryClient,
  )

  return router
}
