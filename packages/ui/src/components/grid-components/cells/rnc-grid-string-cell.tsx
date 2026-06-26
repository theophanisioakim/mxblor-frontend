import { RncInput } from "../../form-components/rnc-input/rnc-input"
import { Text } from "../../primitives/text"

interface RncGridStringCellProps {
  id: string
  value: string
  editing: boolean
  required?: boolean
}

export function RncGridStringCell({
  id,
  value,
  editing,
  required,
}: Readonly<RncGridStringCellProps>) {
  if (editing) {
    return (
      <RncInput
        id={id}
        type="text"
        defaultValue={value}
        size="sm"
        variant="underlined"
        required={required}
      />
    )
  }

  return <Text className="break-words text-foreground text-sm">{value}</Text>
}
