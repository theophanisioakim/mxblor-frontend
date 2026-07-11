"use client"

import { useGetExpenseCategorySelectOptions } from "@workspace/api-client"
import { useMemo } from "react"

export function useExpenseCategoryOptions() {
  const { data: categorySelectOptions = [] } =
    useGetExpenseCategorySelectOptions()

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
