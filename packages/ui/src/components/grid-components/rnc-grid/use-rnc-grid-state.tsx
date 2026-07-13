"use client"

import { mySessionStorage, StorageKeys } from "@workspace/storage"
import type { SetStateAction } from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { FieldErrors, UseFormReturn } from "react-hook-form"
import { useContainerWidth } from "../../../hooks/use-container-width"
import { useIsMobile } from "../../../hooks/use-is-mobile"
import { resolveColumnType } from "../cells/rnc-grid-cell-resolver"
import type { RncGridContextValue } from "./rnc-grid-context"
import { isRncGridDraftRow } from "./rnc-grid-draft"
import type {
  RncGridColumn,
  RncGridColumnType,
  RncGridData,
  RncGridFetchDataParams,
  RncGridPagination,
  RncGridProps,
  RncGridSort,
} from "./rnc-grid-model"
import { computeClientSideData } from "./utils"

/** Shallow equality for selection key sets — same size and same members. */
function areKeySetsEqual(
  a: Set<string | number>,
  b: Set<string | number>
): boolean {
  if (a.size !== b.size) return false
  for (const key of a) {
    if (!b.has(key)) return false
  }
  return true
}

function focusFirstFormError(errors: FieldErrors) {
  for (const key of Object.keys(errors)) {
    const ref = errors[key]?.ref as { focus?: () => void } | undefined
    if (ref?.focus) {
      ref.focus()
      break
    }
  }
}

const DEFAULT_DISCARD_CONFIRM_MESSAGE =
  "You have unsaved changes. Continuing will discard them. Do you want to continue?"

export default function useRncGridState<
  T,
  S,
  F extends Record<string, unknown> = Record<string, unknown>,
>(props: Readonly<RncGridProps<T, S, F>>): RncGridContextValue<T, S, F> {
  const clientSide = props.clientSide ?? false
  const isMobile = useIsMobile()

  // ── Data fetching ──
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<RncGridData<T>>()
  // Mirrors `data` for use inside the fetch effect's client-side guard without
  // making `data` a reactive dependency — otherwise each server-side fetch
  // (which sets a fresh `data` object) would re-trigger the effect forever.
  const dataRef = useRef<RncGridData<T> | undefined>(undefined)
  const [refreshCounter, setRefreshCounter] = useState(0)
  const [effectiveRefreshTrigger, setEffectiveRefreshTrigger] = useState(
    props.refreshTrigger ?? 0
  )
  const withDiscardConfirmationRef = useRef<
    (action: () => void, message?: string) => void
  >((action) => action())
  const pendingRefetchActionRef = useRef<(() => void) | null>(null)
  const resetAllDirtyRowsRef = useRef<() => void>(() => {})
  const removeDraftRowRef = useRef<(row: T, index: number) => void>(() => {})
  const acknowledgedExternalRefreshRef = useRef(props.refreshTrigger ?? 0)
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false)
  const [discardConfirmMessage, setDiscardConfirmMessage] = useState(
    DEFAULT_DISCARD_CONFIRM_MESSAGE
  )

  // ── Columns ──
  const [columns, setColumns] = useState<RncGridColumn<T, S>[]>(props.columns)
  useEffect(() => {
    setColumns(props.columns)
  }, [props.columns])

  // ── Pagination ──
  const paged = !!props.initialPagination
  const [pagination, setPagination] = useState<RncGridPagination>(
    props.initialPagination ?? {
      type: "default",
      pageSize: 0,
      pageNumber: 0,
      pageSizeOptions: [],
    }
  )

  // ── Sorting ──
  const [sort, setSort] = useState<RncGridSort<S>[]>(props.initialSort)
  const [sortPanelOpen, setSortPanelOpen] = useState(false)

  const primarySort = sort[0]

  const sortableColumns = useMemo(
    () => columns.filter((c) => c.sortable && c.sortKey),
    [columns]
  )
  const activeSortColumn = useMemo(
    () =>
      primarySort
        ? sortableColumns.find((c) => c.sortKey === primarySort.field)
        : undefined,
    [sortableColumns, primarySort]
  )

  function getSortIndex(sortKey: S): number {
    return sort.findIndex((s) => s.field === sortKey)
  }

  function getSortDirection(sortKey: S): "ASC" | "DESC" | undefined {
    return sort.find((s) => s.field === sortKey)?.direction
  }

  function handleSortSelection(sortKey: S) {
    withDiscardConfirmationRef.current(() => {
      const existing = sort.find((s) => s.field === sortKey)
      if (existing) {
        if (existing.direction === "ASC") {
          setSort(
            sort.map((s) =>
              s.field === sortKey ? { ...s, direction: "DESC" as const } : s
            )
          )
        } else {
          setSort(sort.filter((s) => s.field !== sortKey))
        }
      } else {
        setSort([...sort, { field: sortKey, direction: "ASC" }])
      }
    })
  }

  // ── Filtering ──
  const [loadingStoredState, setLoadingStoredState] = useState<boolean>(true)
  const [filtersExpanded, setFiltersExpanded] = useState(false)
  const [filterValues, setFilterValues] = useState<F>({} as F)
  const filterMethodsRef = useRef<UseFormReturn | null>(null)
  const isResettingRef = useRef(false)
  const filterSnapshotRef = useRef<Record<string, unknown> | null>(null)
  const filterLoadCacheRef = useRef<{
    formValues: Partial<F>
    resolved: boolean
  }>({
    formValues: {} as F,
    resolved: false,
  })

  // When there are no filters, resolve loadingStoredState directly
  useEffect(() => {
    if (props.filters?.render) return
    const storedState = mySessionStorage.getJSON<
      RncGridFetchDataParams<S, F> & { id: string }
    >(StorageKeys.GRID_LATEST_SEARCH)
    if (storedState && storedState.id === props.id) {
      mySessionStorage.removeItem(StorageKeys.GRID_LATEST_SEARCH)
      if (paged && storedState.pagination) setPagination(storedState.pagination)
      setSort(storedState.sort)
    }
    setLoadingStoredState(false)
  }, [props.filters?.render, props.id, paged])

  async function handleFilterOnLoad(methods: UseFormReturn) {
    filterMethodsRef.current = methods
  }

  function clearFilters() {
    withDiscardConfirmationRef.current(() => {
      isResettingRef.current = true
      const persistent = props.filters?.persistent ?? {}
      const allFields = filterMethodsRef.current?.getValues() ?? {}
      const clearedFields = Object.fromEntries(
        Object.keys(allFields).map((k) => [k, null])
      )
      filterMethodsRef.current?.reset({ ...clearedFields, ...persistent })
      setFilterValues({} as F)
      setPagination((prev) => ({ ...prev, pageNumber: 0 }))
      setTimeout(() => {
        isResettingRef.current = false
      }, 400)
    })
  }

  function handleReset() {
    withDiscardConfirmationRef.current(() => {
      isResettingRef.current = true
      const defaults = (props.filters?.defaultValues ?? {}) as F
      const persistent = props.filters?.persistent ?? {}
      filterMethodsRef.current?.reset({ ...defaults, ...persistent })
      setFilterValues(defaults)
      if (props.initialPagination) setPagination(props.initialPagination)
      setSort(props.initialSort)
      if (clientSide) setRefreshCounter((c) => c + 1)
      setTimeout(() => {
        isResettingRef.current = false
      }, 400)
    }, props.toolbar?.reset?.confirm)
  }

  async function handleFilterLoad() {
    const persistent = props.filters?.persistent ?? {}
    if (filterLoadCacheRef.current.resolved) {
      return { ...filterValues, ...persistent }
    }
    const storedState = mySessionStorage.getJSON<
      RncGridFetchDataParams<S, F> & { id: string }
    >(StorageKeys.GRID_LATEST_SEARCH)
    let formValues: Partial<F>
    if (storedState && storedState.id === props.id) {
      mySessionStorage.removeItem(StorageKeys.GRID_LATEST_SEARCH)
      if (paged && storedState.pagination) setPagination(storedState.pagination)
      setSort(storedState.sort)
      setFilterValues(storedState.filters)
      formValues = storedState.filters
    } else {
      const defaults = (props.filters?.defaultValues ?? {}) as F
      setFilterValues(defaults)
      formValues = defaults
    }
    filterLoadCacheRef.current = { formValues, resolved: true }
    setLoadingStoredState(false)
    return { ...formValues, ...persistent }
  }

  async function handleFilterValuesChange(methods: UseFormReturn) {
    if (isResettingRef.current) return
    const values = methods.getValues() as F
    const persistentKeys = new Set(Object.keys(props.filters?.persistent ?? {}))
    const userValues = Object.fromEntries(
      Object.entries(values).filter(([k]) => !persistentKeys.has(k))
    ) as F
    withDiscardConfirmationRef.current(() => {
      setPagination((prev) => ({ ...prev, pageNumber: 0 }))
      setFilterValues({ ...userValues })
    })
  }

  function openMobileFilters() {
    filterSnapshotRef.current = filterMethodsRef.current?.getValues() ?? null
    setFiltersExpanded(true)
  }

  function handleMobileSheetOpenChange(open: boolean) {
    if (!open) {
      if (filterSnapshotRef.current !== null) {
        filterMethodsRef.current?.reset(filterSnapshotRef.current)
        filterSnapshotRef.current = null
      }
    }
    setFiltersExpanded(open)
  }

  function applyFilters() {
    withDiscardConfirmationRef.current(() => {
      filterSnapshotRef.current = null
      const values = (filterMethodsRef.current?.getValues() ?? {}) as F
      const persistentKeys = new Set(
        Object.keys(props.filters?.persistent ?? {})
      )
      const userValues = Object.fromEntries(
        Object.entries(values).filter(
          ([k, v]) =>
            !persistentKeys.has(k) &&
            v !== "" &&
            v !== null &&
            v !== undefined &&
            !(Array.isArray(v) && v.length === 0)
        )
      ) as F
      setFilterValues({ ...userValues })
      setPagination((prev) => ({ ...prev, pageNumber: 0 }))
      setFiltersExpanded(false)
    })
  }

  function clearMobileFilters() {
    withDiscardConfirmationRef.current(() => {
      isResettingRef.current = true
      const persistent = props.filters?.persistent ?? {}
      const allFields = filterMethodsRef.current?.getValues() ?? {}
      const clearedFields = Object.fromEntries(
        Object.keys(allFields).map((k) => [k, null])
      )
      filterMethodsRef.current?.reset({ ...clearedFields, ...persistent })
      setFilterValues({} as F)
      setPagination((prev) => ({ ...prev, pageNumber: 0 }))
      filterSnapshotRef.current = filterMethodsRef.current?.getValues() ?? null
      setTimeout(() => {
        isResettingRef.current = false
      }, 400)
    })
  }

  const activeFilterCount = Object.values(filterValues).filter(
    (v) =>
      v !== "" &&
      v !== null &&
      v !== undefined &&
      !(Array.isArray(v) && v.length === 0)
  ).length

  // ── Data fetching effect ──
  const prevRefreshRef = useRef({
    counter: refreshCounter,
    trigger: effectiveRefreshTrigger,
  })

  useEffect(() => {
    if (loadingStoredState) return

    const params = {
      pagination: paged ? pagination : undefined,
      sort,
      filters: filterValues,
    }
    mySessionStorage.setJSON(StorageKeys.GRID_LATEST_SEARCH, {
      ...params,
      id: props.id,
    })

    if (clientSide && dataRef.current) {
      const prev = prevRefreshRef.current
      const isRefresh =
        prev.counter !== refreshCounter ||
        prev.trigger !== effectiveRefreshTrigger
      prevRefreshRef.current = {
        counter: refreshCounter,
        trigger: effectiveRefreshTrigger,
      }
      if (!isRefresh) {
        setLoading(false)
        return
      }
    }

    const controller = new AbortController()
    setLoading(true)

    const timer = setTimeout(async () => {
      try {
        let dataResponse: RncGridData<T>
        if (clientSide) {
          dataResponse = await props.fetchData({
            pagination: undefined,
            sort: [],
            filters: (props.filters?.persistent ?? {}) as F,
            signal: controller.signal,
          })
        } else {
          const cleanedFilters = Object.fromEntries(
            Object.entries(filterValues).filter(
              ([, v]) => !(Array.isArray(v) && v.length === 0)
            )
          )
          const fetchFilters = {
            ...cleanedFilters,
            ...props.filters?.persistent,
          } as F
          dataResponse = await props.fetchData({
            pagination: paged ? pagination : undefined,
            sort,
            filters: fetchFilters,
            signal: controller.signal,
          })
        }
        dataRef.current = dataResponse
        setData(dataResponse)
        setLoading(false)
      } catch (e) {
        if (!controller.signal.aborted) {
          setLoading(false)
          console.debug(e)
        }
      }
    }, 300)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [
    pagination,
    sort,
    loadingStoredState,
    refreshCounter,
    filterValues,
    effectiveRefreshTrigger,
    clientSide,
    props.fetchData,
    props.id,
    props.filters?.persistent,
    paged,
  ])

  // ── Client-side data processing ──
  const processedData = useMemo(() => {
    if (!clientSide || !data) return data
    return computeClientSideData(
      data.data,
      filterValues,
      sort,
      pagination,
      paged,
      props.filters?.clientFilter,
      columns
    )
  }, [
    clientSide,
    data,
    filterValues,
    sort,
    pagination,
    paged,
    columns,
    props.filters?.clientFilter,
  ])

  // ── Inline draft rows (row mode add) ──
  const [draftRows, setDraftRows] = useState<T[]>([])
  const [dirtyDraftKeys, setDirtyDraftKeys] = useState<Set<string | number>>(
    new Set()
  )

  const isDraftRow = useCallback(
    (row: T) =>
      props.inlineEdit?.isDraftRow?.(row) ??
      isRncGridDraftRow(row as { id?: string }),
    [props.inlineEdit?.isDraftRow]
  )

  const displayData = useMemo(() => {
    const base = processedData ?? data
    if (!base || draftRows.length === 0) return base
    return {
      ...base,
      data: [...draftRows, ...base.data],
    }
  }, [processedData, data, draftRows])

  // ── Selection ──
  const keyExtractor = props.keyExtractor
  const selectable = !!props.selection
  const singleSelection = props.selection?.single ?? false
  const persistSelection = props.selection?.persist ?? false
  const [selectedKeys, setSelectedKeys] = useState<Set<string | number>>(
    new Set()
  )
  const selectedRowsCacheRef = useRef<Map<string | number, T>>(new Map())

  useEffect(() => {
    if (!data?.data) return
    if (props.selection?.resolveSelectedKeys) {
      const keys = props.selection.resolveSelectedKeys(data.data)
      const newSet = new Set(keys)
      // Bail out when the resolved keys are unchanged so an unstable
      // `keyExtractor`/`resolveSelectedKeys` (recreated each render) can't spin a
      // selection → onChange → re-render loop. Returning `prev` skips the update.
      setSelectedKeys((prev) => (areKeySetsEqual(prev, newSet) ? prev : newSet))
      selectedRowsCacheRef.current.clear()
      for (const row of data.data) {
        const key = keyExtractor(row, 0)
        if (newSet.has(key)) {
          selectedRowsCacheRef.current.set(key, row)
        }
      }
    } else if (!persistSelection) {
      setSelectedKeys((prev) => (prev.size === 0 ? prev : new Set()))
      selectedRowsCacheRef.current.clear()
    }
  }, [
    data,
    keyExtractor,
    props.selection?.resolveSelectedKeys,
    persistSelection,
  ])

  const currentPageRows = displayData?.data ?? []
  const allSelected =
    currentPageRows.length > 0 &&
    currentPageRows.every((row, i) => selectedKeys.has(keyExtractor(row, i)))
  const someSelected =
    !allSelected &&
    currentPageRows.some((row, i) => selectedKeys.has(keyExtractor(row, i)))

  function isRowSelected(row: T, index: number): boolean {
    return selectedKeys.has(keyExtractor(row, index))
  }

  function toggleRowSelection(row: T, index: number) {
    const key = keyExtractor(row, index)
    if (singleSelection) {
      if (selectedKeys.has(key)) {
        selectedRowsCacheRef.current.clear()
        setSelectedKeys(new Set())
      } else {
        selectedRowsCacheRef.current.clear()
        selectedRowsCacheRef.current.set(key, row)
        setSelectedKeys(new Set([key]))
      }
    } else {
      setSelectedKeys((prev) => {
        const next = new Set(prev)
        if (next.has(key)) {
          next.delete(key)
          selectedRowsCacheRef.current.delete(key)
        } else {
          next.add(key)
          selectedRowsCacheRef.current.set(key, row)
        }
        return next
      })
    }
  }

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedKeys((prev) => {
        const next = new Set(prev)
        currentPageRows.forEach((row, i) => {
          const key = keyExtractor(row, i)
          next.delete(key)
          selectedRowsCacheRef.current.delete(key)
        })
        return next
      })
    } else {
      setSelectedKeys((prev) => {
        const next = new Set(prev)
        currentPageRows.forEach((row, i) => {
          const key = keyExtractor(row, i)
          next.add(key)
          selectedRowsCacheRef.current.set(key, row)
        })
        return next
      })
    }
  }

  function clearSelection() {
    setSelectedKeys(new Set())
    selectedRowsCacheRef.current.clear()
  }

  useEffect(() => {
    if (!props.selection?.onChange || !selectable) return
    // Derive the rows from `selectedKeys` so this fires on every selection
    // change (toggling a row mutates `selectedKeys`); the cache holds the row
    // objects for the currently-selected keys.
    const selectedRows: T[] = []
    for (const key of selectedKeys) {
      const row = selectedRowsCacheRef.current.get(key)
      if (row) selectedRows.push(row)
    }
    props.selection.onChange(selectedRows)
  }, [selectable, props.selection?.onChange, selectedKeys])

  // ── Row actions ──
  const actions = props.actions
  const hasActions = !!(
    actions?.view ||
    actions?.edit ||
    actions?.delete ||
    (actions?.custom && actions.custom.length > 0)
  )
  const isEditAll =
    props.addEditMode === "inline" && props.inlineEdit?.mode === "all"

  let actionsCount = 0
  // `view` and `edit` are counted separately even though a grid that declares
  // both usually shows only one per row (opposite `hidden` predicates). Nothing
  // enforces that, so reserving a slot for each is the only width that can never
  // clip; the cost is one empty slot on grids that do pair them.
  if (actions?.view) actionsCount++
  if (actions?.edit) actionsCount++
  if (actions?.delete) actionsCount++
  if (actions?.custom) actionsCount += actions.custom.length
  // In inline edit mode, save + cancel buttons replace normal actions — ensure width fits both
  const editingActionsCount =
    props.addEditMode === "inline" && props.inlineEdit ? 2 : 0
  // In mode 'all', reserve space for the per-row discard button even without other actions
  const editAllActionsCount = isEditAll ? 1 : 0
  const ACTION_SLOT_WIDTH = 40
  const actionsWidth = isEditAll
    ? editAllActionsCount * 30
    : hasActions
      ? Math.max(actionsCount, editingActionsCount) * ACTION_SLOT_WIDTH
      : 0

  // ── Inline editing ──
  const [editingRowKeys, setEditingRowKeys] = useState<Set<string | number>>(
    new Set()
  )

  function startEditingRow(row: T, index: number) {
    const key = keyExtractor(row, index)
    setEditingRowKeys((prev) => new Set(prev).add(key))
  }

  function cancelEditingRow(row: T, index: number) {
    const key = keyExtractor(row, index)
    if (isDraftRow(row)) {
      removeDraftRow(row, index)
    }
    setEditingRowKeys((prev) => {
      const next = new Set(prev)
      next.delete(key)
      return next
    })
    props.inlineEdit?.onCancel?.(row)
  }

  function isRowEditing(row: T, index: number): boolean {
    if (props.addEditMode !== "inline" || !props.inlineEdit) return false
    if (isDraftRow(row)) return true
    if (props.inlineEdit.mode === "all") return true
    return editingRowKeys.has(keyExtractor(row, index))
  }

  async function saveEditingRow(
    row: T,
    index: number,
    formValues: Record<string, unknown>
  ): Promise<boolean> {
    if (!props.inlineEdit?.onSave) return false
    const success = await props.inlineEdit.onSave(row, formValues as Partial<T>)
    if (success) {
      const key = keyExtractor(row, index)
      if (isDraftRow(row)) {
        removeDraftRow(row, index)
      }
      setEditingRowKeys((prev) => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
      setRefreshCounter((c) => c + 1)
    }
    return success
  }

  // ── Inline edit mode 'all' — dirty tracking ──
  const rowFormsRef = useRef<Map<string | number, UseFormReturn>>(new Map())
  const [dirtyRowKeys, setDirtyRowKeys] = useState<Set<string | number>>(
    new Set()
  )

  function registerRowForm(rowKey: string | number, methods: UseFormReturn) {
    rowFormsRef.current.set(rowKey, methods)
  }

  function handleDraftFormChange(rowKey: string | number) {
    const methods = rowFormsRef.current.get(rowKey)
    if (!methods) return
    const values = methods.getValues()
    const hasValue = columns.some((col) => {
      if (col.editable === false) return false
      const value = values[col.key]
      return value !== undefined && value !== null && value !== ""
    })
    setDirtyDraftKeys((prev) => {
      if (hasValue === prev.has(rowKey)) return prev
      const next = new Set(prev)
      if (hasValue) next.add(rowKey)
      else next.delete(rowKey)
      return next
    })
  }

  function discardNonDirtyDraftRows() {
    const removedKeys = draftRows
      .filter((draft) => !dirtyDraftKeys.has(keyExtractor(draft, 0)))
      .map((draft) => keyExtractor(draft, 0))

    setDraftRows((prev) =>
      prev.filter((draft) => dirtyDraftKeys.has(keyExtractor(draft, 0)))
    )

    if (removedKeys.length > 0) {
      setEditingRowKeys((prev) => {
        const next = new Set(prev)
        for (const key of removedKeys) {
          next.delete(key)
        }
        return next
      })
      for (const key of removedKeys) {
        rowFormsRef.current.delete(key)
      }
    }
  }

  function removeDraftRow(row: T, index: number) {
    const key = keyExtractor(row, index)
    setDraftRows((prev) =>
      prev.filter(
        (draft, draftIndex) => keyExtractor(draft, draftIndex) !== key
      )
    )
    setDirtyDraftKeys((prev) => {
      if (!prev.has(key)) return prev
      const next = new Set(prev)
      next.delete(key)
      return next
    })
    rowFormsRef.current.delete(key)
  }

  function handleRowFormChange(rowKey: string | number) {
    const methods = rowFormsRef.current.get(rowKey)
    if (!methods) return
    const rows = displayData?.data ?? []
    const row = rows.find((r, i) => keyExtractor(r, i) === rowKey) as
      | Record<string, unknown>
      | undefined
    if (!row) return
    const current = methods.getValues()
    const isDirty = columns.some(
      (col) =>
        col.editable !== false &&
        String(row[col.key] ?? "") !== String(current[col.key] ?? "")
    )
    setDirtyRowKeys((prev) => {
      if (isDirty === prev.has(rowKey)) return prev
      const next = new Set(prev)
      if (isDirty) next.add(rowKey)
      else next.delete(rowKey)
      return next
    })
  }

  async function saveAllDirtyRows() {
    if (!props.inlineEdit) return
    const rows = displayData?.data ?? []
    const dirtyKeys = Array.from(dirtyRowKeys)
    if (dirtyKeys.length === 0) return

    let allValid = true
    let firstInvalidForm: UseFormReturn | undefined
    for (const rowKey of dirtyKeys) {
      const methods = rowFormsRef.current.get(rowKey)
      if (!methods) continue
      const isValid = await methods.trigger()
      if (!isValid) {
        allValid = false
        firstInvalidForm ??= methods
      }
    }
    if (!allValid) {
      if (firstInvalidForm) {
        focusFirstFormError(firstInvalidForm.formState.errors)
      }
      return
    }

    const entries: { row: T; updatedValues: Partial<T> }[] = []
    for (const rowKey of dirtyKeys) {
      const methods = rowFormsRef.current.get(rowKey)
      if (!methods) continue
      const row = rows.find((r, i) => keyExtractor(r, i) === rowKey)
      if (!row) continue
      entries.push({ row, updatedValues: methods.getValues() as Partial<T> })
    }
    if (entries.length === 0) return

    let success: boolean
    if (props.inlineEdit.onSaveAll) {
      success = await props.inlineEdit.onSaveAll(entries)
    } else {
      success = true
      for (const { row, updatedValues } of entries) {
        success = await props.inlineEdit.onSave(row, updatedValues)
        if (!success) break
      }
    }

    if (success) {
      const savedDraftKeys = new Set(
        entries
          .filter(({ row }) => isDraftRow(row))
          .map(({ row }) => {
            const index = rows.indexOf(row)
            return keyExtractor(row, index >= 0 ? index : 0)
          })
      )
      if (savedDraftKeys.size > 0) {
        setDraftRows((prev) =>
          prev.filter(
            (draft, draftIndex) =>
              !savedDraftKeys.has(keyExtractor(draft, draftIndex))
          )
        )
        setDirtyDraftKeys((prev) => {
          const next = new Set(prev)
          for (const key of savedDraftKeys) {
            next.delete(key)
          }
          return next
        })
      }
      setDirtyRowKeys(new Set())
      setRefreshCounter((c) => c + 1)
    }
  }

  function resetAllDirtyRows() {
    const rows = displayData?.data ?? []
    const draftKeysToRemove: (string | number)[] = []
    for (const [rowKey, methods] of rowFormsRef.current.entries()) {
      const rowIndex = rows.findIndex((r, i) => keyExtractor(r, i) === rowKey)
      if (rowIndex < 0) continue
      const row = rows[rowIndex]
      if (row === undefined) continue
      if (isDraftRow(row)) {
        draftKeysToRemove.push(rowKey)
        continue
      }
      const values: Record<string, unknown> = {}
      for (const col of columns) {
        if (col.editable !== false) {
          values[col.key] = (row as Record<string, unknown>)[col.key]
        }
      }
      methods.reset(values)
    }
    if (draftKeysToRemove.length > 0) {
      const keysToRemove = new Set(draftKeysToRemove)
      setDraftRows((prev) =>
        prev.filter(
          (draft, draftIndex) =>
            !keysToRemove.has(keyExtractor(draft, draftIndex))
        )
      )
      setDirtyDraftKeys((prev) => {
        const next = new Set(prev)
        for (const key of keysToRemove) {
          next.delete(key)
        }
        return next
      })
      for (const key of keysToRemove) {
        rowFormsRef.current.delete(key)
      }
    }
    setDirtyRowKeys(new Set())
  }

  resetAllDirtyRowsRef.current = resetAllDirtyRows
  removeDraftRowRef.current = removeDraftRow

  function isRowDirty(rowKey: string | number): boolean {
    return dirtyRowKeys.has(rowKey)
  }

  function discardRow(rowKey: string | number) {
    const methods = rowFormsRef.current.get(rowKey)
    if (!methods) return
    const rows = displayData?.data ?? []
    const rowIndex = rows.findIndex((r, i) => keyExtractor(r, i) === rowKey)
    if (rowIndex < 0) return
    const row = rows[rowIndex]
    if (row === undefined) return
    if (isDraftRow(row)) {
      removeDraftRow(row, rowIndex)
      setDirtyRowKeys((prev) => {
        const next = new Set(prev)
        next.delete(rowKey)
        return next
      })
      return
    }
    const values: Record<string, unknown> = {}
    for (const col of columns) {
      if (col.editable !== false) {
        values[col.key] = (row as Record<string, unknown>)[col.key]
      }
    }
    methods.reset(values)
    setDirtyRowKeys((prev) => {
      const next = new Set(prev)
      next.delete(rowKey)
      return next
    })
  }

  const hasUnsavedInlineEdits = useCallback((): boolean => {
    if (props.addEditMode !== "inline" || !props.inlineEdit) return false
    if (props.inlineEdit.mode === "all") {
      return dirtyRowKeys.size > 0 || dirtyDraftKeys.size > 0
    }
    return editingRowKeys.size > 0 || dirtyDraftKeys.size > 0
  }, [
    props.addEditMode,
    props.inlineEdit,
    dirtyRowKeys,
    dirtyDraftKeys,
    editingRowKeys,
  ])

  const discardAllInlineEdits = useCallback(() => {
    if (props.addEditMode !== "inline" || !props.inlineEdit) return

    if (props.inlineEdit.mode === "all") {
      resetAllDirtyRowsRef.current()
      return
    }

    const rows = displayData?.data ?? []
    for (const key of editingRowKeys) {
      const rowIndex = rows.findIndex((r, i) => keyExtractor(r, i) === key)
      if (rowIndex < 0) continue
      const row = rows[rowIndex]
      if (row === undefined) continue
      if (isDraftRow(row)) {
        removeDraftRowRef.current(row, rowIndex)
      } else {
        props.inlineEdit.onCancel?.(row)
        rowFormsRef.current.delete(key)
      }
    }
    setEditingRowKeys(new Set())
    setDirtyDraftKeys(new Set())
    setDirtyRowKeys(new Set())
  }, [
    props.addEditMode,
    props.inlineEdit,
    displayData,
    editingRowKeys,
    isDraftRow,
    keyExtractor,
  ])

  function requestRefetchAction(action: () => void, message?: string) {
    if (!hasUnsavedInlineEdits()) {
      action()
      return
    }
    pendingRefetchActionRef.current = () => {
      discardAllInlineEdits()
      action()
    }
    setDiscardConfirmMessage(
      message ??
        props.inlineEdit?.discardConfirm ??
        DEFAULT_DISCARD_CONFIRM_MESSAGE
    )
    setDiscardConfirmOpen(true)
  }

  withDiscardConfirmationRef.current = requestRefetchAction

  function confirmDiscardRefetch() {
    const action = pendingRefetchActionRef.current
    pendingRefetchActionRef.current = null
    setDiscardConfirmOpen(false)
    action?.()
  }

  function cancelDiscardRefetch() {
    const external = props.refreshTrigger ?? 0
    if (external !== effectiveRefreshTrigger) {
      acknowledgedExternalRefreshRef.current = external
    }
    pendingRefetchActionRef.current = null
    setDiscardConfirmOpen(false)
  }

  function guardedSetPagination(action: SetStateAction<RncGridPagination>) {
    withDiscardConfirmationRef.current(() => setPagination(action))
  }

  useEffect(() => {
    const external = props.refreshTrigger ?? 0
    if (external === effectiveRefreshTrigger) {
      acknowledgedExternalRefreshRef.current = external
      return
    }
    if (external === acknowledgedExternalRefreshRef.current) return

    if (hasUnsavedInlineEdits()) {
      pendingRefetchActionRef.current = () => {
        discardAllInlineEdits()
        setEffectiveRefreshTrigger(external)
        acknowledgedExternalRefreshRef.current = external
      }
      setDiscardConfirmMessage(
        props.inlineEdit?.discardConfirm ?? DEFAULT_DISCARD_CONFIRM_MESSAGE
      )
      setDiscardConfirmOpen(true)
      return
    }

    setEffectiveRefreshTrigger(external)
    acknowledgedExternalRefreshRef.current = external
  }, [
    props.refreshTrigger,
    effectiveRefreshTrigger,
    props.inlineEdit,
    hasUnsavedInlineEdits,
    discardAllInlineEdits,
  ])

  function guardedIncrementRefreshCounter() {
    requestRefetchAction(() => setRefreshCounter((c) => c + 1))
  }

  // ── Modal editing ──
  const [modalEditRow, setModalEditRow] = useState<T | null>(null)

  function openModalEdit(row: T) {
    setModalEditRow(row)
  }

  function closeModalEdit() {
    if (modalEditRow) {
      props.modalEdit?.onCancel?.(modalEditRow)
    }
    setModalEditRow(null)
  }

  async function saveModalEdit(
    formData: Record<string, unknown>
  ): Promise<boolean> {
    if (!modalEditRow || !props.modalEdit?.onSave) return false
    const success = await props.modalEdit.onSave(modalEditRow, formData)
    if (success) {
      setModalEditRow(null)
      setRefreshCounter((c) => c + 1)
    }
    return success
  }

  function handleViewPress(row: T) {
    if (!actions?.view) return
    if (isDraftRow(row)) return
    // Unlike edit, view never starts an inline or modal edit session — it only
    // opens the row somewhere read-only.
    if (actions.view.route) {
      const route =
        typeof actions.view.route === "function"
          ? actions.view.route(row)
          : actions.view.route
      props.onNavigate?.(route)
      return
    }
    if (actions.view.onPress) {
      actions.view.onPress(row)
    }
  }

  function handleEditPress(row: T) {
    if (!actions?.edit) return
    if (isDraftRow(row)) return
    if (props.addEditMode === "inline") {
      const index = (displayData?.data ?? []).indexOf(row)
      if (editingRowKeys.has(keyExtractor(row, index))) {
        cancelEditingRow(row, index)
      } else {
        startEditingRow(row, index)
      }
      return
    }
    if (actions.edit.route) {
      const route =
        typeof actions.edit.route === "function"
          ? actions.edit.route(row)
          : actions.edit.route
      props.onNavigate?.(route)
      return
    }
    if (props.addEditMode === "modal" && props.modalEdit) {
      openModalEdit(row)
      return
    }
    if (actions.edit.onPress) {
      actions.edit.onPress(row)
    }
  }

  // ── Delete confirmation ──
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null)
  const showDeleteConfirm = actions?.delete?.confirm !== false

  function handleDeletePress(row: T) {
    if (!actions?.delete) return
    const index = displayData?.data?.indexOf(row) ?? 0
    if (isDraftRow(row)) {
      removeDraftRow(row, index)
      return
    }
    if (showDeleteConfirm) {
      setDeleteTarget(row)
    } else {
      const deleteAction = actions.delete
      requestRefetchAction(() => {
        Promise.resolve(deleteAction.onPress(row)).then(() => {
          guardedIncrementRefreshCounter()
        })
      })
    }
  }

  function confirmDelete() {
    const target = deleteTarget
    setDeleteTarget(null)
    if (!target || !actions?.delete) return
    const deleteAction = actions.delete
    requestRefetchAction(() => {
      Promise.resolve(deleteAction.onPress(target)).then(() => {
        guardedIncrementRefreshCounter()
      })
    })
  }

  function cancelDelete() {
    setDeleteTarget(null)
  }

  const deleteConfirmConfig =
    typeof actions?.delete?.confirm === "object"
      ? actions.delete.confirm
      : undefined
  const deleteDialogTitle = deleteConfirmConfig?.title ?? "Confirm Delete"
  let deleteDialogDescription = ""
  if (deleteTarget) {
    if (typeof deleteConfirmConfig?.description === "function") {
      deleteDialogDescription = deleteConfirmConfig.description(deleteTarget)
    } else {
      deleteDialogDescription =
        deleteConfirmConfig?.description ??
        "Are you sure you want to delete this item? This action cannot be undone."
    }
  }

  // ── Responsive column collapse ──
  const DEFAULT_COL_MIN_WIDTH = 120
  const CHECKBOX_WIDTH = selectable ? 40 : 0
  const EXPAND_CHEVRON_WIDTH = 32
  const ROW_HORIZONTAL_PADDING = 24

  const { width: containerWidth, containerProps } = useContainerWidth()
  const [expandedRows, setExpandedRows] = useState<Set<string | number>>(
    new Set()
  )

  const { visibleColumns, overflowColumns } = useMemo(() => {
    if (containerWidth === 0) {
      return {
        visibleColumns: columns,
        overflowColumns: [] as RncGridColumn<T, S>[],
      }
    }

    const sorted = columns
      .map((col, i) => ({ col, priority: col.priority ?? i }))
      .sort((a, b) => a.priority - b.priority)

    function fitColumns(reserveChevron: boolean) {
      let remaining =
        containerWidth - CHECKBOX_WIDTH - actionsWidth - ROW_HORIZONTAL_PADDING
      if (reserveChevron) remaining -= EXPAND_CHEVRON_WIDTH
      const vis: RncGridColumn<T, S>[] = []
      const ovf: RncGridColumn<T, S>[] = []
      for (const { col } of sorted) {
        const needed = col.minWidth ?? DEFAULT_COL_MIN_WIDTH
        if (remaining >= needed) {
          vis.push(col)
          remaining -= needed
        } else {
          ovf.push(col)
        }
      }
      return { vis, ovf }
    }

    let { vis, ovf } = fitColumns(false)
    if (ovf.length > 0) {
      ;({ vis, ovf } = fitColumns(true))
    }

    const firstColumn = sorted[0]
    if (vis.length === 0 && firstColumn) {
      vis.push(firstColumn.col)
      ovf = sorted.slice(1).map((s) => s.col)
    }

    const visibleKeys = new Set(vis.map((c) => c.key))
    return {
      visibleColumns: columns.filter((c) => visibleKeys.has(c.key)),
      overflowColumns: columns.filter((c) => !visibleKeys.has(c.key)),
    }
  }, [columns, containerWidth, CHECKBOX_WIDTH, actionsWidth])

  function toggleRowExpanded(rowKey: string | number) {
    setExpandedRows((prev) => {
      if (prev.has(rowKey)) {
        const next = new Set(prev)
        next.delete(rowKey)
        return next
      }
      if (props.expandable?.single) {
        return new Set([rowKey])
      }
      return new Set(prev).add(rowKey)
    })
  }

  function isRowExpanded(rowKey: string | number) {
    return expandedRows.has(rowKey)
  }

  // ── Toolbar ──
  const toolbar = props.toolbar
  const hasToolbar = !!(
    props.filters?.render ||
    toolbar?.add ||
    toolbar?.refresh ||
    toolbar?.reset ||
    (toolbar?.custom && toolbar.custom.length > 0) ||
    sortableColumns.length > 0
  )

  function handleRefresh() {
    requestRefetchAction(() => {
      discardNonDirtyDraftRows()
      setRefreshCounter((c) => c + 1)
    }, props.toolbar?.refresh?.confirm)
  }

  function handleResetGrid() {
    handleReset()
  }

  function handleAddPress() {
    if (!toolbar?.add) return
    if (props.addEditMode === "modal" && props.modalEdit) {
      setModalEditRow({} as T)
      return
    }
    if (
      props.addEditMode === "inline" &&
      props.inlineEdit?.createDraftRow &&
      (props.inlineEdit.mode === "row" || props.inlineEdit.mode === "all")
    ) {
      const draft = props.inlineEdit.createDraftRow()
      const key = keyExtractor(draft, 0)
      setDraftRows((prev) => [draft, ...prev])
      if (props.inlineEdit.mode === "row") {
        setEditingRowKeys((prev) => new Set(prev).add(key))
      }
      return
    }
    if (toolbar.add.route) {
      props.onNavigate?.(toolbar.add.route)
    } else if (toolbar.add.onPress) {
      toolbar.add.onPress()
    }
  }

  // ── Resolved column types ──
  const resolvedColumnTypes = useMemo(() => {
    const rows = data?.data ?? []
    return new Map<string, RncGridColumnType>(
      columns.map((col) => [col.key, resolveColumnType(col, rows)])
    )
  }, [columns, data])

  // ── Return context value ──
  return {
    id: props.id,
    keyExtractor,
    isMobile,
    data: displayData,
    loading,
    refresh: handleRefresh,
    columns,
    visibleColumns,
    overflowColumns,
    hasOverflow: overflowColumns.length > 0,
    resolvedColumnTypes,
    containerProps,
    paged,
    pagination,
    setPagination: guardedSetPagination,
    sort,
    sortableColumns,
    activeSortColumn,
    handleSortSelection,
    getSortIndex,
    getSortDirection,
    sortPanelOpen,
    setSortPanelOpen,
    filtersConfig: props.filters,
    filtersExpanded,
    setFiltersExpanded,
    filterValues,
    activeFilterCount,
    clearFilters,
    handleFilterLoad,
    handleFilterOnLoad,
    handleFilterValuesChange,
    openMobileFilters,
    handleMobileSheetOpenChange,
    applyFilters,
    clearMobileFilters,
    selectable,
    singleSelection,
    rowClickable: props.selection?.rowClickable ?? false,
    showSelectionBar: props.selection?.showSelectionBar ?? true,
    allSelected,
    someSelected,
    selectedCount: selectedKeys.size,
    isRowSelected,
    toggleRowSelection,
    toggleSelectAll,
    clearSelection,
    getSelectedRows: () => Array.from(selectedRowsCacheRef.current.values()),
    bulkActions: props.selection?.bulkActions?.map((action) => ({
      ...action,
      onPress: (rows: T[]) => {
        requestRefetchAction(() => {
          Promise.resolve(action.onPress(rows)).then(() => {
            setRefreshCounter((c) => c + 1)
            clearSelection()
          })
        })
      },
    })),
    actions,
    hasActions,
    actionsWidth,
    handleViewPress,
    handleEditPress,
    handleDeletePress,
    addEditMode: props.addEditMode ?? "default",
    inlineEdit: props.inlineEdit,
    isDraftRow,
    isRowEditing,
    cancelEditingRow,
    saveEditingRow,
    registerRowForm,
    handleRowFormChange,
    handleDraftFormChange,
    dirtyRowCount: dirtyRowKeys.size,
    isRowDirty,
    discardRow,
    saveAllDirtyRows,
    resetAllDirtyRows,
    modalEdit: props.modalEdit,
    modalEditRow,
    closeModalEdit,
    saveModalEdit,
    deleteTarget,
    confirmDelete,
    cancelDelete,
    deleteDialogTitle,
    deleteDialogDescription,
    discardConfirmOpen,
    discardConfirmMessage,
    confirmDiscardRefetch,
    cancelDiscardRefetch,
    expandableRender: props.expandable?.render,
    toggleRowExpanded,
    isRowExpanded,
    toolbar,
    hasToolbar,
    handleReset: handleResetGrid,
    handleAddPress,
  }
}
