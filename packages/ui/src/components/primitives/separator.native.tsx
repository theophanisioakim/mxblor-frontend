import { Separator as NativeUiSeparator } from "@workspace/native-ui/components/ui/separator"
import type { SeparatorProps } from "./separator.shared"

/**
 * Cross-platform Separator — native variant.
 *
 * Wraps the react-native-reusables `Separator`. The web variant
 * (`separator.tsx`) wraps the shadcn `Separator`. Both accept the same
 * `SeparatorProps` contract.
 */
function Separator(props: Readonly<SeparatorProps>) {
  return <NativeUiSeparator {...props} />
}

export type { SeparatorProps } from "./separator.shared"
export { Separator }
