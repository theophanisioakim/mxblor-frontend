"use client"

import { ErrorScreen } from "@workspace/app"

export default function ErrorBoundary({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string }
  reset: () => void
}>) {
  return <ErrorScreen error={error} reset={reset} />
}
