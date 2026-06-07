"use client"

import { RncBottomSheet } from "../../../overlays/rnc-bottom-sheet/rnc-bottom-sheet"
import { useRncGridContext } from "../rnc-grid-context"
import { RncGridSortColumnList } from "./rnc-grid-sort-column-list"

export function RncGridMobileSortSheet() {
  const { isMobile, sortableColumns, sortPanelOpen, setSortPanelOpen } =
    useRncGridContext()

  if (!isMobile || sortableColumns.length === 0) return null

  return (
    <RncBottomSheet
      open={sortPanelOpen}
      onOpenChange={setSortPanelOpen}
      title="Sort by"
      snapPoints={[45]}
      footer={null}
    >
      <RncGridSortColumnList />
    </RncBottomSheet>
  )
}
