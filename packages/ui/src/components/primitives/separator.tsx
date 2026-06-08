import { Separator as WebUiSeparator } from "@workspace/web-ui/components/ui/separator"
import type { SeparatorProps } from "./separator.shared"

/**
 * Cross-platform Separator — web variant.
 *
 * Wraps the shadcn `Separator`. The native variant (`separator.native.tsx`)
 * wraps the react-native-reusables `Separator`. Both accept the same
 * `SeparatorProps` contract.
 */
function Separator(props: Readonly<SeparatorProps>) {
  return <WebUiSeparator {...props} />
}

export type { SeparatorProps } from "./separator.shared"
export { Separator }
