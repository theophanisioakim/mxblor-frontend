import {
  Button as NativeUiButton,
  type ButtonProps as NativeUiButtonProps,
} from "@workspace/native-ui/components/ui/button"

type ButtonProps = NativeUiButtonProps

/**
 * Cross-platform Button — native variant.
 *
 * Renders the react-native-reusables button from `@workspace/native-ui`.
 * The web variant lives in `button.tsx` and wraps `@workspace/web-ui`.
 * Metro picks this file on native; webpack/Next picks `button.tsx` on web.
 */
function Button(props: ButtonProps) {
  return <NativeUiButton {...props} />
}

export { buttonVariants } from "@workspace/native-ui/components/ui/button"
export type { ButtonProps }
export { Button }
