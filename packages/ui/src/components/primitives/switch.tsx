import { Switch as WebUiSwitch } from "@workspace/web-ui/components/ui/switch"

type SwitchProps = {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
  id?: string
  "aria-invalid"?: boolean
  "aria-describedby"?: string
  "aria-required"?: boolean
}

/**
 * Cross-platform Switch — web variant.
 *
 * Wraps the shadcn (radix) `Switch`. The native variant (`switch.native.tsx`)
 * wraps the rnr `Switch` with the same contract. Indeterminate/unset visuals
 * are handled by the consuming field, not the primitive.
 */
function Switch(props: Readonly<SwitchProps>) {
  return <WebUiSwitch {...props} />
}

export type { SwitchProps }
export { Switch }
