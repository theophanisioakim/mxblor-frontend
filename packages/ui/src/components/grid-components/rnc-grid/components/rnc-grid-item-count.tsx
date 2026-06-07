import { Text } from "../../../primitives/text"
import { useRncGridContext } from "../rnc-grid-context"

export function RncGridItemCount() {
  const { data } = useRncGridContext()
  if (data === undefined) return null
  return (
    <Text className="text-muted-foreground text-xs">
      {`${data.pagination.totalElements} items`}
    </Text>
  )
}
