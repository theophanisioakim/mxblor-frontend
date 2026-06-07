import { Button as WebUiButton } from "@workspace/web-ui/components/button"
import type * as React from "react"

type ButtonProps = React.ComponentProps<typeof WebUiButton> & {
  /**
   * Cross-platform press handler. Maps to `onClick` on web and `onPress` on
   * native (`button.native.tsx`), so shared screens/components can use one prop.
   */
  onPress?: () => void
}

/**
 * Cross-platform Button — web variant.
 *
 * Renders the shadcn button from `@workspace/web-ui`. The native variant lives
 * in `button.native.tsx` (wraps `@workspace/native-ui`). `onPress` is mapped to
 * the DOM `onClick` here so a single handler works on both platforms.
 */
function Button({ onPress, onClick, ...props }: ButtonProps) {
  return (
    <WebUiButton
      onClick={onClick ?? (onPress ? () => onPress() : undefined)}
      {...props}
    />
  )
}

export { buttonVariants } from "@workspace/web-ui/components/button"
export type { ButtonProps }
export { Button }
