import { RncInput } from "../../form-components/rnc-input/rnc-input"
import { Text } from "../../primitives/text"

interface RncGridNumberCellProps {
  id: string
  value: number
  editing: boolean
}

export function RncGridNumberCell({
  id,
  value,
  editing,
}: Readonly<RncGridNumberCellProps>) {
  if (editing) {
    return (
      <RncInput
        id={id}
        type="number"
        defaultValue={value}
        size="sm"
        variant="underlined"
      />
    )
  }

  return <Text className="text-foreground text-sm">{String(value)}</Text>
}
