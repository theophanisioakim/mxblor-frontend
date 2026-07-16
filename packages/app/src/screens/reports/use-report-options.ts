"use client"

import { useQuery } from "@tanstack/react-query"
import {
  searchBuildingDistributions,
  searchBuildings,
  searchBuildingUnits,
} from "@workspace/api-client"
import { useMemo } from "react"

export function useReportOptions(
  buildingId: string,
  requirements: Readonly<{
    units: boolean
    distributions: boolean
  }>
) {
  const buildings = useQuery({
    queryKey: ["reportBuildings"],
    queryFn: () => searchBuildings({ page: 0, size: 100 }),
  })
  const units = useQuery({
    queryKey: ["reportBuildingUnits", buildingId],
    queryFn: () => searchBuildingUnits({ page: 0, size: 100, buildingId }),
    enabled: !!buildingId && requirements.units,
  })
  const distributions = useQuery({
    queryKey: ["reportBuildingDistributions", buildingId],
    queryFn: () =>
      searchBuildingDistributions({ page: 0, size: 100, buildingId }),
    enabled: !!buildingId && requirements.distributions,
  })

  return useMemo(
    () => ({
      buildingOptions: (buildings.data?.content ?? [])
        .filter((building) => building.id)
        .map((building) => ({
          id: building.id as string,
          label:
            [building.code, building.name].filter(Boolean).join(" — ") ||
            (building.id as string),
        })),
      unitOptions: (units.data?.content ?? [])
        .filter((unit) => unit.id)
        .map((unit) => ({
          id: unit.id as string,
          label:
            [unit.code, unit.ownerNames].filter(Boolean).join(" — ") ||
            (unit.id as string),
        })),
      distributionOptions: (distributions.data?.content ?? [])
        .filter((distribution) => distribution.id && !distribution.isHidden)
        .map((distribution) => ({
          id: distribution.id as string,
          label: distribution.name ?? (distribution.id as string),
        })),
      isLoading:
        buildings.isLoading || units.isLoading || distributions.isLoading,
      isError: buildings.isError || units.isError || distributions.isError,
      buildingsLoaded: buildings.isSuccess,
    }),
    [
      buildings.data,
      buildings.isError,
      buildings.isLoading,
      buildings.isSuccess,
      distributions.data,
      distributions.isError,
      distributions.isLoading,
      units.data,
      units.isError,
      units.isLoading,
    ]
  )
}
