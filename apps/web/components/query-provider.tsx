"use client"

import * as React from "react"
import { axiosInstance } from "@workspace/api-client/mutator"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

// Point the generated API client at the backend. Configure other axios
// defaults (auth headers, interceptors) here as well.
axiosInstance.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL ?? ""

function QueryProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  // Keep a single QueryClient for the lifetime of the app.
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

export { QueryProvider }
