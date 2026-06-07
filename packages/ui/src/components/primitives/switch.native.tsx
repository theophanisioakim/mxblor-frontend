import { Switch as NativeUiSwitch } from "@workspace/native-ui/components/ui/switch"
import type { SwitchProps } from "./switch"

/**
 * Cross-platform Switch — native variant.
 *
 * Wraps the react-native-reusables `Switch`. Same contract as the web variant.
 */
function Switch({
  checked = false,
  onCheckedChange,
  "aria-invalid": _ariaInvalid,
  "aria-describedby": _ariaDescribedby,
  "aria-required": _ariaRequired,
  ...props
}: Readonly<SwitchProps>) {
  return (
    <NativeUiSwitch
      checked={checked}
      onCheckedChange={onCheckedChange ?? (() => {})}
      {...props}
    />
  )
}

export type { SwitchProps } from "./switch"
export { Switch }
