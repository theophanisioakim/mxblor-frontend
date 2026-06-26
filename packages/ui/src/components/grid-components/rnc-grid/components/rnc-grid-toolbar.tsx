"use client"

import { cn } from "@workspace/ui/lib/utils"
import { Button } from "../../../primitives/button"
import {
  ChevronDown,
  ChevronUp,
  Filter,
  Icon,
  Plus,
  RefreshCw,
  RotateCcw,
  X,
} from "../../../primitives/icon"
import { Pressable } from "../../../primitives/pressable"
import { Text } from "../../../primitives/text"
import { View } from "../../../primitives/view"
import { useRncGridContext } from "../rnc-grid-context"
import { RncGridSortButton } from "./rnc-grid-sort-button"

export function RncGridToolbar() {
  const {
    hasToolbar,
    filtersConfig,
    filtersExpanded,
    setFiltersExpanded,
    isMobile,
    openMobileFilters,
    activeFilterCount,
    clearFilters,
    toolbar,
    handleReset,
    refresh,
    handleAddPress,
  } = useRncGridContext()

  if (!hasToolbar) return null

  return (
    <View className="flex-row flex-wrap items-center justify-between gap-2">
      {/* Left: filter toggle + sort */}
      <View className="flex-row items-center gap-2">
        {filtersConfig?.render && (
          <View className="flex-row items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onPress={() =>
                isMobile ? openMobileFilters() : setFiltersExpanded((v) => !v)
              }
              className={cn(!isMobile && filtersExpanded && "bg-accent")}
            >
              <Icon as={Filter} size={15} />
              <Text className="text-sm">Filters</Text>
              {activeFilterCount > 0 && (
                <View className="h-5 min-w-5 items-center justify-center rounded-full bg-primary px-2">
                  <Text className="font-bold text-[11px] text-primary-foreground">
                    {activeFilterCount}
                  </Text>
                </View>
              )}
              {!isMobile && (
                <Icon
                  as={filtersExpanded ? ChevronUp : ChevronDown}
                  size={14}
                />
              )}
            </Button>
            {activeFilterCount > 0 && (
              <Pressable
                className="cursor-pointer rounded-md p-1 hover:bg-accent"
                onPress={() => clearFilters()}
                aria-label="Clear filters"
              >
                <Icon as={X} size={14} className="text-muted-foreground" />
              </Pressable>
            )}
          </View>
        )}
        <RncGridSortButton />
      </View>

      {/* Right: toolbar actions */}
      <View className="flex-row flex-wrap items-center gap-2">
        {toolbar?.custom?.map((action) => (
          <Button
            key={action.key}
            variant={action.variant ?? "ghost"}
            size="sm"
            onPress={action.onPress}
            disabled={action.disabled}
            className={cn(action.disabled && "opacity-50")}
          >
            {action.icon}
            <Text className="text-sm">{action.label}</Text>
          </Button>
        ))}
        {toolbar?.reset && (
          <Button
            variant="ghost"
            size="sm"
            onPress={() => {
              toolbar.reset?.onPress?.()
              handleReset()
            }}
          >
            <Icon as={RotateCcw} size={15} />
            <Text className="text-sm">{toolbar.reset.label ?? "Reset"}</Text>
          </Button>
        )}
        {toolbar?.refresh && (
          <Button
            variant="ghost"
            size="sm"
            onPress={() => {
              toolbar.refresh?.onPress?.()
              refresh()
            }}
          >
            <Icon as={RefreshCw} size={15} />
            <Text className="text-sm">
              {toolbar.refresh.label ?? "Refresh"}
            </Text>
          </Button>
        )}
        {toolbar?.add && (
          <Button size="sm" onPress={handleAddPress}>
            <Icon as={Plus} size={15} />
            <Text className="text-sm">{toolbar.add.label ?? "Add"}</Text>
          </Button>
        )}
      </View>
    </View>
  )
}
