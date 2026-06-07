import { Link as ExpoLink } from "expo-router"
import type { ComponentProps } from "react"
import type { RouteHref } from "./href"
import { toExpoHref } from "./href"

type ExpoLinkProps = ComponentProps<typeof ExpoLink>

type LinkProps = Omit<ExpoLinkProps, "href"> & {
  href: RouteHref
  scroll?: boolean
  transitionTypes?: string[]
}

function Link({
  href,
  scroll: _scroll,
  transitionTypes: _transitionTypes,
  ...props
}: LinkProps) {
  return <ExpoLink href={toExpoHref(href)} {...props} />
}

export type { LinkProps }
export { Link }
