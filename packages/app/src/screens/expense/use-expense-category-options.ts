"use client"

import { useGetExpenseCategorySelectOptions } from "@workspace/api-client"
import { useMemo } from "react"

type UseExpenseCategoryOptionsArgs = {
  /**
   * Offer only user-created (editable) categories.
   *
   * Pass `true` from the create/edit expense **form**: an expense may never be
   * filed under a system-default category, so a locked one must not be
   * selectable (the server rejects it too — see `ExpenseService`).
   *
   * Leave it off everywhere that needs the whole catalog — the expense list's
   * category **filter** and the map that renders the category-name column —
   * because seeded expenses live in seeded categories and must stay filterable
   * and displayable.
   */
  editableOnly?: boolean
}

export function useExpenseCategoryOptions({
  editableOnly,
}: UseExpenseCategoryOptionsArgs = {}) {
  const { data: categorySelectOptions = [] } =
    useGetExpenseCategorySelectOptions(
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
