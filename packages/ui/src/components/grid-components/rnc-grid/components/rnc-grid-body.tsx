import { Spinner } from "../../../primitives/spinner"
import { View } from "../../../primitives/view"
import { useRncGridContext } from "../rnc-grid-context"
import { RncGridEmptyState } from "./rnc-grid-empty-state"
import { RncGridRow } from "./rnc-grid-row"
import { RncGridSkeleton } from "./rnc-grid-skeleton"

export function RncGridBody() {
  const { data, loading, keyExtractor } = useRncGridContext()

  if (data === undefined) {
    return <RncGridSkeleton />
  }

  if (!loading && data.pagination.isEmpty) {
    return <RncGridEmptyState />
  }

  const rows = data.data ?? []

  return (
    <View className="relative">
      {rows.map((row, i) => (
        <RncGridRow key={keyExtractor(row, i)} row={row} rowIndex={i} />
      ))}
      {loading && (
        <View className="absolute inset-0 z-10 items-center justify-center bg-background/70">
          <Spinner />
        </View>
      )}
    </View>
  )
}
