import type {
  RncGridColumn,
  RncGridData,
  RncGridPagination,
  RncGridSort,
} from "./rnc-grid-model"

export function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  if (typeof a === "number" && typeof b === "number") return a - b
  if (typeof a === "boolean" && typeof b === "boolean")
    return a === b ? 0 : a ? 1 : -1
  return String(a).localeCompare(String(b), undefined, { sensitivity: "base" })
}

export function findColumnKey<T, S>(
  sortField: S,
  columns: RncGridColumn<T, S>[]
): string | undefined {
  return columns.find((c) => c.sortKey === sortField)?.key
}

export function computeClientSideData<T, S, F extends Record<string, unknown>>(
  allRows: T[],
  filterValues: F,
  sort: RncGridSort<S>[],
  pagination: RncGridPagination,
  paged: boolean,
  clientFilter: ((row: T, filters: F) => boolean) | undefined,
  columns: RncGridColumn<T, S>[]
): RncGridData<T> {
  // 1. Filter
  let filtered = allRows
  if (clientFilter) {
    const hasActiveFilters = Object.values(filterValues).some(
      (v) => v !== "" && v !== null && v !== undefined
    )
    if (hasActiveFilters) {
      filtered = allRows.filter((row) => clientFilter(row, filterValues))
    }
  }

  // 2. Sort
  let sorted = filtered
  if (sort.length > 0) {
    sorted = [...filtered].sort((a, b) => {
      for (const s of sort) {
        const fieldKey = findColumnKey(s.field, columns) ?? String(s.field)
        const aVal = (a as Record<string, unknown>)[fieldKey]
        const bVal = (b as Record<string, unknown>)[fieldKey]
        const cmp = compareValues(aVal, bVal)
        if (cmp !== 0) return s.direction === "ASC" ? cmp : -cmp
      }
      return 0
    })
  }

  // 3. Paginate
  const totalElements = sorted.length
  if (!paged) {
    return {
      data: sorted,
      pagination: {
        isEmpty: sorted.length === 0,
        isFirst: true,
        isLast: true,
        currentPageNumber: 0,
        currentPageElementsSize: sorted.length,
        currentPageSize: sorted.length,
        totalElements,
        totalPages: 1,
      },
    }
  }

  const { pageNumber, pageSize } = pagination
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize))
  const safePage = Math.min(pageNumber, totalPages - 1)
  const start = safePage * pageSize
  const pageData = sorted.slice(start, start + pageSize)

  return {
    data: pageData,
    pagination: {
      isEmpty: totalElements === 0,
      isFirst: safePage === 0,
      isLast: safePage >= totalPages - 1,
      currentPageNumber: safePage,
      currentPageElementsSize: pageData.length,
      currentPageSize: pageSize,
      totalElements,
      totalPages,
    },
  }
}
