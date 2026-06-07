"use client"

import { RncForm } from "../../../form-components/rnc-form/rnc-form"
import { RncBottomSheet } from "../../../overlays/rnc-bottom-sheet/rnc-bottom-sheet"
import { useRncGridContext } from "../rnc-grid-context"

export function RncGridMobileFilterSheet() {
  const {
    filtersConfig,
    isMobile,
    id,
    filtersExpanded,
    handleFilterLoad,
    handleFilterOnLoad,
    handleMobileSheetOpenChange,
    clearMobileFilters,
    applyFilters,
  } = useRncGridContext()

  if (!filtersConfig || !isMobile) return null

  return (
    <RncForm
      id={`${id}-filters`}
      onSubmit={async () => false}
      loadFormValues={handleFilterLoad}
      onLoad={handleFilterOnLoad}
      unstyled
    >
      <RncBottomSheet
        open={filtersExpanded}
        onOpenChange={handleMobileSheetOpenChange}
        title="Filters"
        onCancel={() => clearMobileFilters()}
        cancelLabel="Clear"
        onConfirm={() => applyFilters()}
        confirmLabel="Apply"
      >
        {filtersConfig.render}
      </RncBottomSheet>
    </RncForm>
  )
}
