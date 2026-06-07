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
  push,
  replace,
  scroll: _scroll,
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
    <Link
      asChild
      href={href}
      prefetch={prefetch ?? undefined}
      push={push}
      replace={replace}
    >
      <Button className={className} size={size} variant={variant}>
        <Text>{children}</Text>
      </Button>
    </Link>
  )
}

export type { LinkButtonProps, LinkButtonSize, LinkButtonVariant }
export { LinkButton }
