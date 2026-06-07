"use client"

import { RncForm } from "../../../form-components/rnc-form/rnc-form"
import { View } from "../../../primitives/view"
import { useRncGridContext } from "../rnc-grid-context"

export function RncGridFilters() {
  const {
    filtersConfig,
    isMobile,
    id,
    filtersExpanded,
    handleFilterLoad,
    handleFilterOnLoad,
    handleFilterValuesChange,
  } = useRncGridContext()

  if (!filtersConfig || isMobile) return null

  return (
    <RncForm
      id={`${id}-filters`}
      onSubmit={async () => false}
      loadFormValues={handleFilterLoad}
      onLoad={handleFilterOnLoad}
      onValuesChange={handleFilterValuesChange}
      unstyled
    >
      {filtersExpanded && filtersConfig.render && (
        <View className="z-40 gap-4 rounded-lg border border-border bg-background p-4">
          {filtersConfig.render}
        </View>
      )}
    </RncForm>
  )
}
