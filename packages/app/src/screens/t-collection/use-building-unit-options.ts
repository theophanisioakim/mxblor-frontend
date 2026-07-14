"use client"

import { useQuery } from "@tanstack/react-query"
import { searchBuildingUnits } from "@workspace/api-client"
import { useMemo } from "react"

type BuildingUnitOptions = {
  options: { id: string; label: string }[]
  byId: Map<string, string>
}

export function useBuildingUnitOptions(
  buildingId: string
): BuildingUnitOptions {
  const { data } = useQuery({
    queryKey: ["buildingUnits", buildingId],
    queryFn: () => searchBuildingUnits({ page: 0, size: 100, buildingId }),
    enabled: !!buildingId,
  })

  return useMemo(() => {
    const options = (data?.content ?? [])
      .filter((unit) => unit.id)
      .map((unit) => ({
        id: unit.id as string,
        label: unit.code
          ? `${unit.code}${unit.ownerNames ? ` — ${unit.ownerNames}` : ""}`
          : (unit.ownerNames ?? unit.id ?? ""),
      }))

    const byId = new Map<string, string>()
    for (const option of options) {
      byId.set(option.id, option.label)
    }

    return { options, byId }
  }, [data?.content])
}
