import { ActivityIndicator } from "react-native"
import type { SpinnerProps } from "./spinner"

/**
 * Cross-platform Spinner — native variant.
 *
 * Renders a react-native `ActivityIndicator`. The web variant (`spinner.tsx`)
 * wraps the shadcn `Spinner`.
 */
function Spinner({ size = "small" }: Readonly<SpinnerProps>) {
  return <ActivityIndicator size={size} />
}

export type { SpinnerProps } from "./spinner"
export { Spinner }
