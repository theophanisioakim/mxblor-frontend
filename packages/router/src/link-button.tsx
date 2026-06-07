"use client"

import { Button, Text } from "@workspace/ui"
import type { ReactNode } from "react"
import type { RouteHref } from "./href"
import { Link } from "./link"

type LinkButtonVariant =
  | "default"
  | "destructive"
  | "ghost"
  | "link"
  | "outline"
  | "secondary"

type LinkButtonSize = "default" | "icon" | "lg" | "sm"

type LinkButtonProps = {
  children: ReactNode
  className?: string
  disabled?: boolean
  href: RouteHref
  prefetch?: boolean | null
  push?: boolean
  replace?: boolean
  scroll?: boolean
  size?: LinkButtonSize
  variant?: LinkButtonVariant
}

function LinkButton({
  children,
  className,
  disabled,
  href,
  prefetch,
  push: _push,
  replace,
  scroll,
  size,
  variant = "outline",
}: Readonly<LinkButtonProps>) {
  if (disabled) {
    return (
      <Button
        className={className}
        disabled={disabled}
        size={size}
        variant={variant}
      >
        <Text>{children}</Text>
      </Button>
    )
  }

  return (
    <Button asChild className={className} size={size} variant={variant}>
      <Link href={href} prefetch={prefetch} replace={replace} scroll={scroll}>
        <Text>{children}</Text>
      </Link>
    </Button>
  )
}

export type { LinkButtonProps, LinkButtonSize, LinkButtonVariant }
export { LinkButton }
