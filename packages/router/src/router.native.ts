import { useRouter as useExpoRouter, useLocalSearchParams } from "expo-router"
import { useMemo } from "react"
import type { RouteHref } from "./href"
import { toExpoHref, toSearchParams } from "./href"

type NavigateOptions = {
  relativeToDirectory?: boolean
}

type Router = {
  back: () => void
  canGoBack: () => boolean
  forward: () => void
  prefetch: (href: RouteHref) => void
  push: (href: RouteHref, options?: NavigateOptions) => void
  refresh: () => void
  replace: (href: RouteHref, options?: NavigateOptions) => void
}

type ExpoRouter = ReturnType<typeof useExpoRouter>
type ExpoHref = Parameters<ExpoRouter["push"]>[0]

function toNativeHref(href: RouteHref): ExpoHref {
  return toExpoHref(href)
}

function toNativeOptions(options: NavigateOptions | undefined) {
  return options
}

function useRouter(): Router {
  const router = useExpoRouter()

  return useMemo(
    () => ({
      back: router.back,
      canGoBack: router.canGoBack,
      forward: () => undefined,
      prefetch: (href) => router.prefetch(toNativeHref(href)),
      push: (href, options) =>
        router.push(toNativeHref(href), toNativeOptions(options)),
      refresh: router.reload,
      replace: (href, options) =>
        router.replace(toNativeHref(href), toNativeOptions(options)),
    }),
    [router]
  )
}

function useSearchParams(): URLSearchParams {
  const params = useLocalSearchParams()

  return useMemo(() => toSearchParams(params), [params])
}

export { usePathname } from "expo-router"
export type { NavigateOptions, Router }
export { useRouter, useSearchParams }
