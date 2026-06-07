import { RncInput } from "../../form-components/rnc-input/rnc-input"
import { Text } from "../../primitives/text"

interface RncGridStringCellProps {
  id: string
  value: string
  editing: boolean
}

export function RncGridStringCell({
  id,
  value,
  editing,
}: Readonly<RncGridStringCellProps>) {
  if (editing) {
    return (
      <RncInput
        id={id}
        type="text"
        defaultValue={value}
        size="sm"
        variant="underlined"
      />
    )
  }

  return <Text className="text-foreground text-sm">{value}</Text>
}
