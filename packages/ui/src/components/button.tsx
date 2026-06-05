import * as React from "react"
import {
  Button as WebUiButton,
  buttonVariants,
} from "@workspace/web-ui/components/button"

type ButtonProps = React.ComponentProps<typeof WebUiButton>

/**
 * Cross-platform Button.
 *
 * For now this simply renders the shadcn button from `@workspace/web-ui`.
 * Later, when `@workspace/native-ui` exists, the native implementation will
 * live in a sibling `button.native.tsx` and this file becomes the web variant.
 */
function Button(props: ButtonProps) {
  return <WebUiButton {...props} />
}

export { Button, buttonVariants }
export type { ButtonProps }
