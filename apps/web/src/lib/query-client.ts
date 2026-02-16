import { QueryClient } from '@tanstack/react-query'

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
        refetchOnWindowFocus: true,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined

export function getQueryClient() {
  if (typeof window === 'undefined') {
    return createQueryClient()
  }
  if (!browserQueryClient) {
    browserQueryClient = createQueryClient()
  }
  return browserQueryClient
}
