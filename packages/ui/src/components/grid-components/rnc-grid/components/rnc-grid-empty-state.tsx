import { FileX, Icon } from "../../../primitives/icon"
import { Text } from "../../../primitives/text"
import { View } from "../../../primitives/view"

export function RncGridEmptyState() {
  return (
    <View className="items-center gap-3 p-6">
      <Icon as={FileX} size={40} className="text-muted-foreground" />
      <Text className="text-muted-foreground">No data found</Text>
    </View>
  )
}
