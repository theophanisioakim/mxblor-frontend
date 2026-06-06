import { cn } from "@workspace/ui/lib/utils"
import type * as React from "react"

type ViewProps = React.ComponentProps<"div">

/**
 * Cross-platform View — web variant.
 *
 * Renders a `<div>` that defaults to a flex column, mirroring react-native's
 * `View` (which is `display: flex; flex-direction: column`). This makes the
 * same `className` contract behave identically on web and native: flex
 * utilities such as `items-center`/`justify-center`/`gap-*` work, and children
 * stack vertically instead of flowing inline. The native variant
 * (`view.native.tsx`) renders a react-native `View` (via NativeWind).
 */
function View({ className, ...props }: ViewProps) {
  return <div className={cn("flex flex-col", className)} {...props} />
}

export type { ViewProps }
export { View }
