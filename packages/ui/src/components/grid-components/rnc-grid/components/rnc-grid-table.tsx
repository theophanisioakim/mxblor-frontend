import { View } from "../../../primitives/view"
import { useRncGridContext } from "../rnc-grid-context"
import { RncGridBody } from "./rnc-grid-body"
import { RncGridFooter } from "./rnc-grid-footer"
import { RncGridHeader } from "./rnc-grid-header"

export function RncGridTable() {
  const { paged } = useRncGridContext()

  return (
    <View className="rounded-lg border border-border">
      <RncGridHeader />
      <RncGridBody />
      {paged && <RncGridFooter />}
    </View>
  )
}
