"use client"

import { useRouter as useNextRouter } from "next/navigation"
import { useMemo } from "react"
import type { RouteHref } from "./href"
import { resolveHref } from "./href"

type NavigateOptions = {
  scroll?: boolean
  transitionTypes?: string[]
}

type Router = {
  back: () => void
  forward: () => void
  prefetch: (href: RouteHref) => void
  push: (href: RouteHref, options?: NavigateOptions) => void
  refresh: () => void
  replace: (href: RouteHref, options?: NavigateOptions) => void
}

function useRouter(): Router {
  const router = useNextRouter()

  return useMemo(
    () => ({
      back: router.back,
      forward: router.forward,
      prefetch: (href) => router.prefetch(resolveHref(href)),
      push: (href, options) => router.push(resolveHref(href), options),
      refresh: router.refresh,
      replace: (href, options) => router.replace(resolveHref(href), options),
    }),
    [router]
  )
}

export { usePathname, useSearchParams } from "next/navigation"
export type { NavigateOptions, Router }
export { useRouter }
