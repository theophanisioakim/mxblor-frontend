import { Label as NativeUiLabel } from "@workspace/native-ui/components/ui/label"
import type { LabelProps } from "./label"

/**
 * Cross-platform Label — native variant.
 *
 * Wraps the react-native-reusables `Label`. The web-only `htmlFor`/`id` props
 * are accepted (for API parity with the web variant) but not forwarded.
 */
function Label({
  htmlFor: _htmlFor,
  id: _id,
  className,
  children,
}: Readonly<LabelProps>) {
  return <NativeUiLabel className={className}>{children}</NativeUiLabel>
}

export type { LabelProps } from "./label"
export { Label }
