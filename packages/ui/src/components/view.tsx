import * as React from "react"

type ViewProps = React.ComponentProps<"div">

/**
 * Cross-platform View — web variant.
 *
 * Renders a plain `<div>`. Tailwind utility classes are applied via
 * `className`. The native variant (`view.native.tsx`) renders a
 * react-native `View` with the same className contract (via NativeWind).
 */
function View(props: ViewProps) {
  return <div {...props} />
}

export { View }
export type { ViewProps }
