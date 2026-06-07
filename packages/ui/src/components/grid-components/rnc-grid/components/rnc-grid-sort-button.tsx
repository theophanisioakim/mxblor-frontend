"use client"

import { cn } from "@workspace/ui/lib/utils"
import { Button } from "../../../primitives/button"
import { ArrowUpDown, Icon } from "../../../primitives/icon"
import { Pressable } from "../../../primitives/pressable"
import { Text } from "../../../primitives/text"
import { View } from "../../../primitives/view"
import { useRncGridContext } from "../rnc-grid-context"
import { RncGridSortColumnList } from "./rnc-grid-sort-column-list"

export function RncGridSortButton() {
  const { sortableColumns, isMobile, sortPanelOpen, setSortPanelOpen } =
    useRncGridContext()

  if (sortableColumns.length === 0) return null

  if (isMobile) {
    return (
      <Button variant="ghost" size="sm" onPress={() => setSortPanelOpen(true)}>
        <Icon as={ArrowUpDown} size={15} />
        <Text className="text-sm">Sort</Text>
      </Button>
    )
  }

  return (
    <View className="relative">
      <Button
        variant="ghost"
        size="sm"
        onPress={() => setSortPanelOpen((v) => !v)}
        className={cn(sortPanelOpen && "bg-accent")}
      >
        <Icon as={ArrowUpDown} size={15} />
        <Text className="text-sm">Sort</Text>
      </Button>
      {sortPanelOpen && (
        <>
          <Pressable
            className="fixed inset-0 z-40"
            onPress={() => setSortPanelOpen(false)}
          />
          <View className="absolute top-full left-0 z-50 mt-1 overflow-hidden rounded-lg border border-border bg-background">
            <RncGridSortColumnList />
          </View>
        </>
      )}
    </View>
  )
}
