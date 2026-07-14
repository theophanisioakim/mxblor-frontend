"use client"

import { useQuery } from "@tanstack/react-query"
import { searchExpenses } from "@workspace/api-client"
import { useMemo } from "react"

const BANK_EXPENSE_CODES = new Set(["190", "191", "192"])

type ExpenseCatalogOptions = {
  options: { id: string; label: string }[]
  byId: Map<string, string>
}

/**
 * Operational expense categories a building expense may point at.
 *
 * Bank rows (190/191/192) are excluded — those are system-driven, not picked on
 * this screen.
 */
export function useExpenseCatalogOptions(): ExpenseCatalogOptions {
  const { data } = useQuery({
    queryKey: ["operationalExpenseCatalog"],
    queryFn: () => searchExpenses({ page: 0, size: 100, editable: false }),
  })

  return useMemo(() => {
    const options = (data?.content ?? [])
      .filter(
        (expense) => expense.id && !BANK_EXPENSE_CODES.has(expense.code ?? "")
      )
      .map((expense) => ({
        id: expense.id as string,
        label: expense.name
          ? `${expense.code ?? ""} — ${expense.name}`.trim()
          : (expense.code ?? expense.id ?? ""),
      }))

    const byId = new Map<string, string>()
    for (const option of options) {
      byId.set(option.id, option.label)
    }

    return { options, byId }
  }, [data])
}
