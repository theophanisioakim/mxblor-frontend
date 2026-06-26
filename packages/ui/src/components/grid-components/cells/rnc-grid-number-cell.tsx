import { RncInput } from "../../form-components/rnc-input/rnc-input"
import type { RncInputProps } from "../../form-components/rnc-input/rnc-input-model"
import { Text } from "../../primitives/text"

interface RncGridNumberCellProps {
  id: string
  value: number | undefined
  editing: boolean
  required?: boolean
  numberValidationRules?: RncInputProps["numberValidationRules"]
}

export function RncGridNumberCell({
  id,
  value,
  editing,
  required,
  numberValidationRules,
}: Readonly<RncGridNumberCellProps>) {
  if (editing) {
    return (
      <RncInput
        id={id}
        type="number"
        defaultValue={value}
        size="sm"
        variant="underlined"
        required={required}
        numberValidationRules={numberValidationRules}
      />
    )
  }

  return (
    <Text className="text-foreground text-sm">
      {value != null ? String(value) : "—"}
    </Text>
  )
}
