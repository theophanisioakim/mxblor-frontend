import { cn } from "@workspace/ui/lib/utils"
import { Checkbox } from "../../../primitives/checkbox"
import { Label } from "../../../primitives/label"
import { Text } from "../../../primitives/text"
import { View } from "../../../primitives/view"
import type { RncCheckboxRenderProps } from "./rnc-checkbox-render-model"
import useRncCheckboxRender from "./use-rnc-checkbox-render"

export default function RncCheckboxRender(
  props: Readonly<RncCheckboxRenderProps>
) {
  const {
    checkboxKey,
    checkboxId,
    errorId,
    helperId,
    isDisabled,
    isInvalid,
    isReadOnly,
    isRequired,
    label,
    helperText,
    errorMessage,
    hidden,
    checked,
    onCheckedChange,
  } = useRncCheckboxRender(props)

  if (hidden) return null

  return (
    <View className={cn("gap-2", isDisabled && "opacity-50")}>
      <View className="flex-row items-center gap-3">
        <Checkbox
          key={checkboxKey}
          id={checkboxId}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={isDisabled || isReadOnly}
          aria-invalid={isInvalid}
          aria-describedby={
            `${isInvalid ? errorId : ""} ${helperText ? helperId : ""}`.trim() ||
            undefined
          }
          aria-required={isRequired}
        />

        {label && (
          <Label htmlFor={checkboxId} className="font-semibold text-foreground">
            {label}
            {isRequired && <Text className="ml-1 text-destructive">*</Text>}
          </Label>
        )}
      </View>

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
