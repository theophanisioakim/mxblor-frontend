import { Link, type RouteHref } from "@workspace/router"
import { cn } from "@workspace/ui"
import type { ReactNode } from "react"

export type NavLinkProps = {
  href: RouteHref
  children?: ReactNode
  className?: string
}

/**
 * Link wrapper that removes the default underline / inherited link color, so
 * navigation rows render as plain clickable areas. Wraps the cross-platform
 * `@workspace/router` `Link` (Next on web, Expo Router on native).
 */
export function NavLink({ className, ...props }: Readonly<NavLinkProps>) {
  return (
    <Link className={cn("text-inherit no-underline", className)} {...props} />
  )
}
