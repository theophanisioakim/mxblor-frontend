"use client"

import { useGetRevenueCategorySelectOptions } from "@workspace/api-client"
import { useMemo } from "react"

type UseRevenueCategoryOptionsArgs = {
  /**
   * Offer only user-created (editable) categories.
   *
   * Pass `true` from the create/edit revenue **form**: an revenue may never be
   * filed under a system-default category, so a locked one must not be
   * selectable (the server rejects it too — see `RevenueService`).
   *
   * Leave it off everywhere that needs the whole catalog — the revenue list's
   * category **filter** and the map that renders the category-name column —
   * because seeded revenues live in seeded categories and must stay filterable
   * and displayable.
   */
  editableOnly?: boolean
}

export function useRevenueCategoryOptions({
  editableOnly,
}: UseRevenueCategoryOptionsArgs = {}) {
  const { data: categorySelectOptions = [] } =
    useGetRevenueCategorySelectOptions(
      editableOnly ? { editableOnly: true } : undefined
    )

  const options = useMemo(
    () =>
      categorySelectOptions
        .filter((option) => option.id != null)
        .map((option) => ({
          id: option.id as string,
          label: option.label ?? (option.id as string),
          filterString: option.filterString,
        })),
    [categorySelectOptions]
  )

  const byId = useMemo(() => {
    const map = new Map<string, string>()
    for (const option of categorySelectOptions) {
      if (option.id) {
        map.set(option.id, option.label ?? option.id)
      }
    }
    return map
  }, [categorySelectOptions])

  return { options, byId }
}
