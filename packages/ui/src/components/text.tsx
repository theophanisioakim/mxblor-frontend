import type * as React from "react"

type TextProps = React.ComponentProps<"span">

/**
 * Cross-platform Text — web variant.
 *
 * Renders a `<span>`. The native variant (`text.native.tsx`) re-exports the
 * react-native-reusables `Text`, which also consumes the button's
 * `TextClassContext` so button labels are styled correctly on native.
 */
function Text(props: TextProps) {
  return <span {...props} />
}

export type { TextProps }
export { Text }
