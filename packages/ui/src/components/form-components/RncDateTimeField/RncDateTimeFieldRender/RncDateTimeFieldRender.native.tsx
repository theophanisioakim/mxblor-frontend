import { cn } from "@workspace/ui/lib/utils"
import { Input } from "../../../primitives/input"
import { Label } from "../../../primitives/label"
import { Text } from "../../../primitives/text"
import { View } from "../../../primitives/view"
import { dateToDisplayString } from "./dateUtils"
import type { RncDateTimeFieldRenderProps } from "./RncDateTimeFieldRenderModel"
import useRncDateTimeFieldRender from "./useRncDateTimeFieldRender"

/**
 * Native variant — there is no HTML date picker, so it shows a human-readable
 * string and uses a numeric keyboard for year/minutes entry.
 */
export default function RncDateTimeFieldRender(
  props: Readonly<RncDateTimeFieldRenderProps>
) {
  const {
    inputKey,
    inputId,
    errorId,
    helperId,
    isInvalid,
    isDisabled,
    isReadOnly,
    isRequired,
    label,
    helperText,
    errorMessage,
    hidden,
    placeholder,
    formValue,
    onChangeValue,
    onBlur,
  } = useRncDateTimeFieldRender(props)

  if (hidden) return null

  return (
    <View className={cn("gap-2", isDisabled && "opacity-50")}>
      {label && (
        <Label htmlFor={inputId} className="font-semibold text-foreground">
          {label}
          {isRequired && <Text className="ml-1 text-destructive">*</Text>}
        </Label>
      )}

      <Input
        key={inputKey}
        id={inputId}
        value={dateToDisplayString(formValue, props.type, props.format)}
        onChangeText={(text) => onChangeValue(text)}
        onBlur={onBlur}
        placeholder={placeholder}
        editable={!isDisabled}
        readOnly={isReadOnly}
        aria-label={label}
        keyboardType={
          props.type === "year" || props.type === "minutes"
            ? "number-pad"
            : "default"
        }
        aria-invalid={isInvalid}
        aria-describedby={
          `${isInvalid ? errorId : ""} ${helperText ? helperId : ""}`.trim() ||
          undefined
        }
        aria-required={isRequired}
      />

      {helperText && !isInvalid && (
        <Text id={helperId} className="text-muted-foreground text-xs">
          {helperText}
        </Text>
      )}

      {isInvalid && (
        <Text id={errorId} role="alert" className="text-destructive text-xs">
          {errorMessage}
        </Text>
      )}
    </View>
  )
}
