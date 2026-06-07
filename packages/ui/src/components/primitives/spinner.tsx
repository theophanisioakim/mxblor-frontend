import { Spinner as WebUiSpinner } from "@workspace/web-ui/components/ui/spinner"

type SpinnerProps = {
  size?: "small" | "large"
  className?: string
}

/**
 * Cross-platform Spinner — web variant.
 *
 * Wraps the shadcn `Spinner` (an animated `Loader2` SVG). The native variant
 * (`spinner.native.tsx`) renders a react-native `ActivityIndicator`, since the
 * CSS `animate-spin` used here does not run on native.
 */
function Spinner({ className }: Readonly<SpinnerProps>) {
  return <WebUiSpinner className={className} />
}

export type { SpinnerProps }
export { Spinner }
