import { Label as WebUiLabel } from "@workspace/web-ui/components/ui/label"
import type * as React from "react"

type LabelProps = {
  htmlFor?: string
  id?: string
  className?: string
  children?: React.ReactNode
}

/**
 * Cross-platform Label — web variant.
 *
 * Wraps the shadcn (radix) `Label`. The native variant (`label.native.tsx`)
 * wraps the rnr `Label` and ignores the web-only `htmlFor`.
 */
function Label(props: Readonly<LabelProps>) {
  return <WebUiLabel {...props} />
}

export type { LabelProps }
export { Label }
