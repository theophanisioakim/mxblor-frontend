import type { RncSelectOption } from "@workspace/ui"

/**
 * Countries offered when entering a building address. Shared by the buildings
 * list filter and the create-building form so both stay in sync.
 */
export const COUNTRY_OPTIONS: RncSelectOption[] = [
  { id: "CY", label: "Cyprus" },
  { id: "GR", label: "Greece" },
  { id: "GB", label: "United Kingdom" },
  { id: "DE", label: "Germany" },
  { id: "FR", label: "France" },
  { id: "IT", label: "Italy" },
  { id: "US", label: "United States" },
]
