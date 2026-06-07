import { cn } from "@workspace/ui/lib/utils"
import { Button } from "../../../primitives/button"
import { Eye, EyeOff, Icon } from "../../../primitives/icon"
import { Input } from "../../../primitives/input"
import { Label } from "../../../primitives/label"
import { Text } from "../../../primitives/text"
import { View } from "../../../primitives/view"
import type { RncInputRenderProps } from "./rnc-input-render-model"
import useRncInputRender from "./use-rnc-input-render"

export default function RncInputRender(props: Readonly<RncInputRenderProps>) {
  const {
    inputKey,
    inputId,
    errorId,
    helperId,
    placeholder,
    type,
    onBlur,
    onChangeText,
    inputValue,
    keyboardType,
    onSelectionChange,
    selection,
    isDisabled,
    isInvalid,
    isReadOnly,
    isRequired,
    label,
    helperText,
    errorMessage,
    hidden,
    autoCapitalize,
    autoComplete,
    maxLength,
    formValue,
    showPassword,
    setShowPassword,
  } = useRncInputRender(props)

  if (hidden) return null

  return (
    <View className={cn("gap-2", isDisabled && "opacity-50")}>
      {label && (
        <Label htmlFor={inputId} className="font-semibold text-foreground">
          {label}
          {isRequired && <Text className="ml-1 text-destructive">*</Text>}
        </Label>
      )}

      <View>
        <View className="relative">
          <Input
            key={inputKey}
            id={inputId}
            value={inputValue}
            onChangeText={onChangeText}
            onBlur={onBlur}
            placeholder={placeholder}
            editable={!isDisabled}
            readOnly={isReadOnly}
            secureTextEntry={type === "password" && !showPassword}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoComplete={autoComplete}
            selection={selection}
            onSelectionChange={onSelectionChange}
            aria-label={label}
            aria-invalid={isInvalid}
            aria-describedby={
              `${isInvalid ? errorId : ""} ${helperText ? helperId : ""}`.trim() ||
              undefined
            }
            aria-required={isRequired}
            className={type === "password" ? "pr-12" : undefined}
          />

          {type === "password" && (
            <Button
              variant="ghost"
              size="icon"
              onPress={() => setShowPassword(!showPassword)}
              disabled={isDisabled}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute top-1/2 right-1 size-7 -translate-y-1/2"
            >
              <Icon as={showPassword ? EyeOff : Eye} size={16} />
            </Button>
          )}
        </View>

        {maxLength && (
          <Text className="mt-1 text-right text-muted-foreground text-xs">
            {(formValue?.toString() || "").length} / {maxLength}
          </Text>
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
