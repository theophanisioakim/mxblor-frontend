import { cn } from "@workspace/ui/lib/utils"
import { Input } from "../../../primitives/input"
import { Label } from "../../../primitives/label"
import { Text } from "../../../primitives/text"
import { View } from "../../../primitives/view"
import { dateToInputString } from "./date-utils"
import type { RncDateTimeFieldRenderProps } from "./rnc-date-time-field-render-model"
import useRncDateTimeFieldRender from "./use-rnc-date-time-field-render"

/**
 * Web variant — uses the native HTML date/time inputs (`type`/`min`/`max`) and
 * the machine-readable input string for the value.
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
    htmlInputType,
    minInputValue,
    maxInputValue,
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
        type={htmlInputType}
        min={minInputValue}
        max={maxInputValue}
        value={dateToInputString(formValue, props.type)}
        onChangeText={(text) => onChangeValue(text)}
        onBlur={onBlur}
        placeholder={placeholder}
        editable={!isDisabled}
        readOnly={isReadOnly}
        aria-label={label}
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
