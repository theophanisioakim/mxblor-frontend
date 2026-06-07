"use client"

import NextLink from "next/link"
import type { ComponentProps } from "react"
import type { RouteHref } from "./href"
import { toNextHref } from "./href"

type NextLinkProps = ComponentProps<typeof NextLink>

type LinkProps = Omit<NextLinkProps, "as" | "href" | "legacyBehavior"> & {
  asChild?: boolean
  href: RouteHref
  push?: boolean
  relativeToDirectory?: boolean
}

function Link({
  asChild: _asChild,
  href,
  push: _push,
  relativeToDirectory: _relativeToDirectory,
  ...props
}: LinkProps) {
  return <NextLink href={toNextHref(href)} {...props} />
}

export type { LinkProps }
export { Link }
