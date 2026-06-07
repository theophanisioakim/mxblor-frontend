import { Button } from "../../../primitives/button"
import { Text } from "../../../primitives/text"
import { View } from "../../../primitives/view"
import { useRncGridContext } from "../rnc-grid-context"

export function RncGridBulkActionBar() {
  const {
    selectable,
    showSelectionBar,
    selectedCount,
    bulkActions,
    getSelectedRows,
    clearSelection,
  } = useRncGridContext()

  if (!selectable || !showSelectionBar) return null
  if (selectedCount === 0) return null

  return (
    <View className="flex-row flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2">
      <Text className="font-semibold text-primary text-sm">
        {selectedCount} {selectedCount === 1 ? "item" : "items"} selected
      </Text>
      <View className="flex-row flex-wrap items-center gap-2">
        {bulkActions?.map((action) => (
          <Button
            key={action.key}
            size="sm"
            onPress={() => action.onPress(getSelectedRows())}
          >
            {action.icon}
            <Text className="text-sm">{action.label}</Text>
          </Button>
        ))}
        <Button variant="ghost" size="sm" onPress={clearSelection}>
          <Text className="text-sm">Clear selection</Text>
        </Button>
      </View>
    </View>
  )
}
