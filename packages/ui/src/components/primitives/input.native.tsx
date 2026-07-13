import { Input as NativeUiInput } from "@workspace/native-ui/components/ui/input"
import type { TextInputProps } from "react-native"
import type { InputProps } from "./input"

/**
 * Cross-platform Input — native variant.
 *
 * Forwards the RN-flavored contract straight to the react-native-reusables
 * `Input` (`TextInput`), which already speaks `onChangeText`/`value`/
 * `secureTextEntry`/`keyboardType`/`selection`/`onSelectionChange`/`editable`.
 * The web-only HTML passthrough props (`type`/`min`/`max`) and web-only ARIA
 * attributes are dropped; `keyboardType`/`autoComplete` are widened in the
 * contract and narrowed to the RN unions here. `onEscape` becomes an
 * `onKeyPress` filter — it only fires with a hardware keyboard attached.
 */
function Input({
  disabled,
  editable,
  type: _type,
  min: _min,
  max: _max,
  keyboardType,
  autoComplete,
  onEscape,
  "aria-invalid": _ariaInvalid,
  "aria-describedby": _ariaDescribedby,
  "aria-required": _ariaRequired,
  ...props
}: Readonly<InputProps>) {
  return (
    <NativeUiInput
      editable={editable ?? (disabled ? false : undefined)}
      keyboardType={keyboardType as TextInputProps["keyboardType"]}
      autoComplete={autoComplete as TextInputProps["autoComplete"]}
      onKeyPress={
        onEscape
          ? (e) => {
              if (e.nativeEvent.key === "Escape") onEscape()
            }
          : undefined
      }
      {...props}
    />
  )
}

export type { InputProps, InputSelection } from "./input"
export { Input }
