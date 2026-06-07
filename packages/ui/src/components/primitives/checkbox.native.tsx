import { Checkbox as NativeUiCheckbox } from "@workspace/native-ui/components/ui/checkbox"
import { View } from "react-native"
import type { CheckboxProps } from "./checkbox"
import { Icon, Minus } from "./icon"

/**
 * Cross-platform Checkbox — native variant.
 *
 * Wraps the react-native-reusables `Checkbox` (boolean-only). The
 * `"indeterminate"` state is emulated: the box renders checked with its check
 * icon hidden and a `Minus` glyph overlaid, matching the web variant. The field
 * hook drives the actual tri-state value, so `onCheckedChange`'s argument is
 * ignored downstream.
 */
function Checkbox({
  checked,
  onCheckedChange,
  "aria-invalid": _ariaInvalid,
  "aria-describedby": _ariaDescribedby,
  "aria-required": _ariaRequired,
  ...props
}: Readonly<CheckboxProps>) {
  const indeterminate = checked === "indeterminate"
  return (
    <View className="relative">
      <NativeUiCheckbox
        checked={indeterminate ? true : Boolean(checked)}
        onCheckedChange={onCheckedChange ?? (() => {})}
        iconClassName={indeterminate ? "opacity-0" : undefined}
        {...props}
      />
      {indeterminate && (
        <View className="absolute inset-0 items-center justify-center">
          <Icon as={Minus} size={12} className="text-primary-foreground" />
        </View>
      )}
    </View>
  )
}

export type { CheckboxProps, CheckedState } from "./checkbox"
export { Checkbox }
