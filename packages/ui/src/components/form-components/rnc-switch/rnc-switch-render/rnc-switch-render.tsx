import { cn } from "@workspace/ui/lib/utils"
import { Label } from "../../../primitives/label"
import { Switch } from "../../../primitives/switch"
import { Text } from "../../../primitives/text"
import { View } from "../../../primitives/view"
import type { RncSwitchRenderProps } from "./rnc-switch-render-model"
import useRncSwitchRender from "./use-rnc-switch-render"

export default function RncSwitchRender(props: Readonly<RncSwitchRenderProps>) {
  const {
    switchKey,
    switchId,
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
    isIndeterminate,
    onCheckedChange,
  } = useRncSwitchRender(props)

  if (hidden) return null

  return (
    <View className={cn("gap-2", isDisabled && "opacity-50")}>
      <View className="flex-row items-center gap-3">
        <Switch
          key={switchKey}
          id={switchId}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={isDisabled || isReadOnly}
          aria-invalid={isInvalid}
          aria-describedby={
            `${isInvalid ? errorId : ""} ${helperText ? helperId : ""}`.trim() ||
            undefined
          }
          aria-required={isRequired}
          className={cn(
            isIndeterminate && "opacity-50",
            isInvalid && "border-destructive"
          )}
        />

        {label && (
          <Label htmlFor={switchId} className="font-semibold text-foreground">
            {label}
            {isRequired && <Text className="ml-1 text-destructive">*</Text>}
            {isIndeterminate && (
              <Text className="ml-1 text-muted-foreground text-xs">
                (unset)
              </Text>
            )}
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
