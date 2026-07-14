"use client"

import { useQuery } from "@tanstack/react-query"
import { searchBuildingDistributions } from "@workspace/api-client"
import { useMemo } from "react"

type BuildingDistributionOptions = {
  options: { id: string; label: string }[]
  byId: Map<string, string>
}

/** Distribution tables belonging to one building. */
export function useBuildingDistributionOptions(
  buildingId: string
): BuildingDistributionOptions {
  const { data } = useQuery({
    queryKey: ["buildingDistributionOptions", buildingId],
    queryFn: () =>
      searchBuildingDistributions({ page: 0, size: 100, buildingId }),
    enabled: !!buildingId,
  })

  return useMemo(() => {
    const options = (data?.content ?? [])
      .filter((table) => table.id)
      .map((table) => ({
        id: table.id as string,
        label: table.name ?? table.id ?? "",
      }))

    const byId = new Map<string, string>()
    for (const option of options) {
      byId.set(option.id, option.label)
    }

    return { options, byId }
  }, [data])
}
