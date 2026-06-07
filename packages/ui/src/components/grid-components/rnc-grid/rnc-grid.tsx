"use client"

import type { ComponentProps } from "react"
import { View } from "../../primitives/view"
import { RncGridBulkActionBar } from "./components/rnc-grid-bulk-action-bar"
import { RncGridDialogs } from "./components/rnc-grid-dialogs"
import { RncGridDirtyBar } from "./components/rnc-grid-dirty-bar"
import { RncGridFilters } from "./components/rnc-grid-filters"
import { RncGridItemCount } from "./components/rnc-grid-item-count"
import { RncGridMobileFilterSheet } from "./components/rnc-grid-mobile-filter-sheet"
import { RncGridMobileSortSheet } from "./components/rnc-grid-mobile-sort-sheet"
import { RncGridTable } from "./components/rnc-grid-table"
import { RncGridToolbar } from "./components/rnc-grid-toolbar"
import { RncGridProvider, useRncGridContext } from "./rnc-grid-context"
import type { RncGridProps } from "./rnc-grid-model"

export function RncGrid<
  T,
  S,
  F extends Record<string, unknown> = Record<string, unknown>,
>(props: Readonly<RncGridProps<T, S, F>>) {
  return (
    <RncGridProvider props={props}>
      <RncGridInner />
    </RncGridProvider>
  )
}

function RncGridInner() {
  const { containerProps, isMobile, filtersConfig } = useRncGridContext()

  return (
    <View
      className="gap-3"
      {...(containerProps as unknown as ComponentProps<typeof View>)}
    >
      <RncGridToolbar />
      <RncGridFilters />

      {isMobile && filtersConfig && <RncGridMobileFilterSheet />}

      <RncGridMobileSortSheet />
      <RncGridBulkActionBar />
      <RncGridDirtyBar />
      <RncGridItemCount />
      <RncGridTable />
      <RncGridDialogs />
    </View>
  )
}
