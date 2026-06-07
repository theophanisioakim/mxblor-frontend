import { cn } from "@workspace/ui/lib/utils"
import type * as React from "react"
import type { PressableEvent } from "./pressable.shared"

type PressableProps = Omit<React.ComponentProps<"div">, "onClick"> & {
  /**
   * Cross-platform press handler. Maps to `onClick` on web and `onPress` on
   * native (`pressable.native.tsx` re-exports react-native's `Pressable`).
   */
  onPress?: (event?: PressableEvent) => void
  disabled?: boolean
}

/**
 * Cross-platform Pressable — web variant.
 *
 * Renders a `<div>` whose click fires `onPress`. Mirrors react-native's
 * `Pressable` so shared components (e.g. the grid's rows, header cells, and
 * icon buttons) can be interactive on both platforms with one handler. Like
 * `View`, it defaults to `flex flex-col` so the same `className` flex contract
 * (`flex-row`, `items-center`, `gap-*`, …) behaves identically to native.
 */
function Pressable({
  onPress,
  disabled,
  className,
  ...props
}: Readonly<PressableProps>) {
  const interactive = !!onPress && !disabled

  // Non-interactive: a plain container (no handlers, no a11y role).
  if (!interactive) {
    return <div className={cn("flex flex-col", className)} {...props} />
  }

  function handleClick(event: React.MouseEvent<HTMLDivElement>) {
    onPress?.(event)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      onPress?.(event)
    }
  }

  return (
    // biome-ignore lint/a11y/useSemanticElements: this cross-platform Pressable mirrors react-native's Pressable and must allow arbitrary (incl. nested-pressable) children, so it cannot render a <button>; it still exposes a button role + Enter/Space keyboard handling.
    <div
      {...props}
      className={cn("flex flex-col", className)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    />
  )
}

export type { PressableProps }
export { Pressable }
