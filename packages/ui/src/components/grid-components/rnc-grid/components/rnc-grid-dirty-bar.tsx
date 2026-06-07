import { Button } from "../../../primitives/button"
import { Icon, Save, Undo2 } from "../../../primitives/icon"
import { Text } from "../../../primitives/text"
import { View } from "../../../primitives/view"
import { useRncGridContext } from "../rnc-grid-context"

export function RncGridDirtyBar() {
  const { inlineEdit, dirtyRowCount, saveAllDirtyRows, resetAllDirtyRows } =
    useRncGridContext()

  if (inlineEdit?.mode !== "all") return null
  if (dirtyRowCount === 0) return null

  return (
    <View className="flex-row flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
      <Text className="font-semibold text-amber-700 text-sm">
        {dirtyRowCount} unsaved {dirtyRowCount === 1 ? "change" : "changes"}
      </Text>
      <View className="flex-row items-center gap-2">
        <Button variant="ghost" size="sm" onPress={resetAllDirtyRows}>
          <Icon as={Undo2} size={15} />
          <Text className="text-sm">Discard</Text>
        </Button>
        <Button size="sm" onPress={() => saveAllDirtyRows()}>
          <Icon as={Save} size={15} />
          <Text className="text-sm">Save All</Text>
        </Button>
      </View>
    </View>
  )
}
