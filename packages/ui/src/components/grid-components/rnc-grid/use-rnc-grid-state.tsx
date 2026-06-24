"use client"

import { mySessionStorage, StorageKeys } from "@workspace/storage"
import { useEffect, useMemo, useRef, useState } from "react"
import type { UseFormReturn } from "react-hook-form"
import { useContainerWidth } from "../../../hooks/use-container-width"
import { useIsMobile } from "../../../hooks/use-is-mobile"
import { resolveColumnType } from "../cells/rnc-grid-cell-resolver"
import type { RncGridContextValue } from "./rnc-grid-context"
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
  }

  function handleReset() {
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
    setPagination((prev) => ({ ...prev, pageNumber: 0 }))
    setFilterValues({ ...userValues })
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
    filterSnapshotRef.current = null
    const values = (filterMethodsRef.current?.getValues() ?? {}) as F
    const persistentKeys = new Set(Object.keys(props.filters?.persistent ?? {}))
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
  }

  function clearMobileFilters() {
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
    trigger: props.refreshTrigger,
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
        prev.counter !== refreshCounter || prev.trigger !== props.refreshTrigger
      prevRefreshRef.current = {
        counter: refreshCounter,
        trigger: props.refreshTrigger,
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
    props.refreshTrigger,
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

  const currentPageRows = processedData?.data ?? []
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
    actions?.edit ||
    actions?.delete ||
    (actions?.custom && actions.custom.length > 0)
  )
  const isEditAll =
    props.addEditMode === "inline" && props.inlineEdit?.mode === "all"

  let actionsCount = 0
  if (actions?.edit) actionsCount++
  if (actions?.delete) actionsCount++
  if (actions?.custom) actionsCount += actions.custom.length
  // In inline edit mode, save + cancel buttons replace normal actions — ensure width fits both
  const editingActionsCount =
    props.addEditMode === "inline" && props.inlineEdit ? 2 : 0
  // In mode 'all', reserve space for the per-row discard button even without other actions
  const editAllActionsCount = isEditAll ? 1 : 0
  const actionsWidth =
    hasActions || isEditAll
      ? Math.max(actionsCount, editingActionsCount, editAllActionsCount) * 40
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
    setEditingRowKeys((prev) => {
      const next = new Set(prev)
      next.delete(key)
      return next
    })
    props.inlineEdit?.onCancel?.(row)
  }

  function isRowEditing(row: T, index: number): boolean {
    if (props.addEditMode !== "inline" || !props.inlineEdit) return false
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

  function handleRowFormChange(rowKey: string | number) {
    const methods = rowFormsRef.current.get(rowKey)
    if (!methods) return
    const rows = processedData?.data ?? []
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
    const rows = processedData?.data ?? []
    const entries: { row: T; updatedValues: Partial<T> }[] = []
    for (const rowKey of dirtyRowKeys) {
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
      setDirtyRowKeys(new Set())
      setRefreshCounter((c) => c + 1)
    }
  }

  function resetAllDirtyRows() {
    const rows = processedData?.data ?? []
    for (const [rowKey, methods] of rowFormsRef.current.entries()) {
      const row = rows.find((r, i) => keyExtractor(r, i) === rowKey) as
        | Record<string, unknown>
        | undefined
      if (!row) continue
      const values: Record<string, unknown> = {}
      for (const col of columns) {
        if (col.editable !== false) {
          values[col.key] = row[col.key]
        }
      }
      methods.reset(values)
    }
    setDirtyRowKeys(new Set())
  }

  function isRowDirty(rowKey: string | number): boolean {
    return dirtyRowKeys.has(rowKey)
  }

  function discardRow(rowKey: string | number) {
    const methods = rowFormsRef.current.get(rowKey)
    if (!methods) return
    const rows = processedData?.data ?? []
    const row = rows.find((r, i) => keyExtractor(r, i) === rowKey) as
      | Record<string, unknown>
      | undefined
    if (!row) return
    const values: Record<string, unknown> = {}
    for (const col of columns) {
      if (col.editable !== false) {
        values[col.key] = row[col.key]
      }
    }
    methods.reset(values)
    setDirtyRowKeys((prev) => {
      const next = new Set(prev)
      next.delete(rowKey)
      return next
    })
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

  function handleEditPress(row: T) {
    if (!actions?.edit) return
    if (props.addEditMode === "inline") {
      const index = (processedData?.data ?? []).indexOf(row)
      if (editingRowKeys.has(keyExtractor(row, index))) {
        cancelEditingRow(row, index)
      } else {
        startEditingRow(row, index)
      }
      return
    }
    if (props.addEditMode === "modal" && props.modalEdit) {
      openModalEdit(row)
      return
    }
    if (actions.edit.route) {
      const route =
        typeof actions.edit.route === "function"
          ? actions.edit.route(row)
          : actions.edit.route
      props.onNavigate?.(route)
    } else if (actions.edit.onPress) {
      actions.edit.onPress(row)
    }
  }

  // ── Delete confirmation ──
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null)
  const showDeleteConfirm = actions?.delete?.confirm !== false

  function handleDeletePress(row: T) {
    if (!actions?.delete) return
    if (showDeleteConfirm) {
      setDeleteTarget(row)
    } else {
      Promise.resolve(actions.delete.onPress(row)).then(() => {
        setRefreshCounter((c) => c + 1)
      })
    }
  }

  function confirmDelete() {
    if (deleteTarget && actions?.delete) {
      Promise.resolve(actions.delete.onPress(deleteTarget)).then(() => {
        setRefreshCounter((c) => c + 1)
      })
    }
    setDeleteTarget(null)
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
    setRefreshCounter((c) => c + 1)
  }

  function handleAddPress() {
    if (!toolbar?.add) return
    if (props.addEditMode === "modal" && props.modalEdit) {
      setModalEditRow({} as T)
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
    data: processedData,
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
    setPagination,
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
        Promise.resolve(action.onPress(rows)).then(() => {
          setRefreshCounter((c) => c + 1)
          clearSelection()
        })
      },
    })),
    actions,
    hasActions,
    actionsWidth,
    handleEditPress,
    handleDeletePress,
    addEditMode: props.addEditMode ?? "default",
    inlineEdit: props.inlineEdit,
    isRowEditing,
    cancelEditingRow,
    saveEditingRow,
    registerRowForm,
    handleRowFormChange,
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
    expandableRender: props.expandable?.render,
    toggleRowExpanded,
    isRowExpanded,
    toolbar,
    hasToolbar,
    handleReset,
    handleAddPress,
  }
}
