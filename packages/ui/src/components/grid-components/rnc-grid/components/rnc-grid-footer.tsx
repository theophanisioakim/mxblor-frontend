"use client"

import { cn } from "@workspace/ui/lib/utils"
import { useState } from "react"
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Icon,
} from "../../../primitives/icon"
import { Pressable } from "../../../primitives/pressable"
import { Text } from "../../../primitives/text"
import { View } from "../../../primitives/view"
import { useRncGridContext } from "../rnc-grid-context"

const NAV_BTN = "size-8 items-center justify-center rounded-md"

export function RncGridFooter() {
  const { data, pagination, setPagination } = useRncGridContext()
  const [pageSizeOpen, setPageSizeOpen] = useState(false)

  if (data === undefined) return null

  function handlePageSizeChange(opt: number) {
    const newPagination = { ...pagination, pageSize: opt }
    if (data) {
      const newPageCount = Math.ceil(data.pagination.totalElements / opt)
      if (pagination.pageNumber + 1 > newPageCount) {
        newPagination.pageNumber = Math.max(0, newPageCount - 1)
      }
    }
    setPagination(newPagination)
    setPageSizeOpen(false)
  }

  const canGoPrev = pagination.pageNumber > 0
  const canGoNext = pagination.pageNumber < data.pagination.totalPages - 1

  return (
    <View className="flex-row items-center justify-between gap-2 rounded-b-lg border-border border-t bg-muted/50 px-3 py-2">
      {/* Page size dropdown */}
      <View className="relative">
        <Pressable
          className="cursor-pointer flex-row items-center gap-1 rounded-md border border-border px-2 py-1 hover:bg-accent"
          onPress={() => setPageSizeOpen((v) => !v)}
        >
          <Text className="text-muted-foreground text-xs">Rows:</Text>
          <Text className="font-bold text-xs">{pagination.pageSize}</Text>
          <Icon as={ChevronDown} size={12} className="text-muted-foreground" />
        </Pressable>
        {pageSizeOpen && (
          <>
            <Pressable
              className="fixed inset-0 z-40"
              onPress={() => setPageSizeOpen(false)}
            />
            <View className="absolute bottom-full left-0 z-50 mb-1 min-w-[60px] overflow-hidden rounded-md border border-border bg-background">
              {pagination.pageSizeOptions.map((opt) => (
                <Pressable
                  key={opt}
                  className={cn(
                    "cursor-pointer px-3 py-2 hover:bg-accent",
                    pagination.pageSize === opt && "bg-accent"
                  )}
                  onPress={() => handlePageSizeChange(opt)}
                >
                  <Text
                    className={cn(
                      "text-xs",
                      pagination.pageSize === opt ? "font-bold" : "font-normal"
                    )}
                  >
                    {opt}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </View>

      {/* Page navigation */}
      <View className="flex-row items-center gap-1">
        <Pressable
          className={cn(
            NAV_BTN,
            canGoPrev ? "cursor-pointer hover:bg-accent" : "opacity-0"
          )}
          onPress={
            canGoPrev
              ? () => setPagination({ ...pagination, pageNumber: 0 })
              : undefined
          }
        >
          <Icon as={ChevronsLeft} size={16} className="text-foreground" />
        </Pressable>
        <Pressable
          className={cn(
            NAV_BTN,
            canGoPrev ? "cursor-pointer hover:bg-accent" : "opacity-0"
          )}
          onPress={
            canGoPrev
              ? () =>
                  setPagination({
                    ...pagination,
                    pageNumber: pagination.pageNumber - 1,
                  })
              : undefined
          }
        >
          <Icon as={ChevronLeft} size={16} className="text-foreground" />
        </Pressable>
        <Text className="text-xs">{`${pagination.pageNumber + 1} / ${data.pagination.totalPages}`}</Text>
        <Pressable
          className={cn(
            NAV_BTN,
            canGoNext ? "cursor-pointer hover:bg-accent" : "opacity-0"
          )}
          onPress={
            canGoNext
              ? () =>
                  setPagination({
                    ...pagination,
                    pageNumber: pagination.pageNumber + 1,
                  })
              : undefined
          }
        >
          <Icon as={ChevronRight} size={16} className="text-foreground" />
        </Pressable>
        <Pressable
          className={cn(
            NAV_BTN,
            canGoNext ? "cursor-pointer hover:bg-accent" : "opacity-0"
          )}
          onPress={
            canGoNext
              ? () =>
                  setPagination({
                    ...pagination,
                    pageNumber: data.pagination.totalPages - 1,
                  })
              : undefined
          }
        >
          <Icon as={ChevronsRight} size={16} className="text-foreground" />
        </Pressable>
      </View>
    </View>
  )
}
