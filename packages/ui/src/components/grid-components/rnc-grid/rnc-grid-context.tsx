"use client"

import type { Dispatch, ReactNode, SetStateAction } from "react"
import { createContext, useContext } from "react"
import type { UseFormReturn } from "react-hook-form"
import type { ContainerBindProps } from "../../../hooks/use-container-width.shared"
import type {
  RncGridActions,
  RncGridBulkAction,
  RncGridColumn,
  RncGridColumnType,
  RncGridData,
  RncGridFiltersConfig,
  RncGridInlineEditConfig,
  RncGridModalEditConfig,
  RncGridPagination,
  RncGridProps,
  RncGridSort,
  RncGridToolbar,
} from "./rnc-grid-model"
import useRncGridState from "./use-rnc-grid-state"

export interface RncGridContextValue<T, S, F extends Record<string, unknown>> {
  // Core
  id: string
  keyExtractor: (row: T, index: number) => string | number

  // Display
  isMobile: boolean

  // Data
  data: RncGridData<T> | undefined
  loading: boolean
  refresh: () => void

  // Columns
  columns: RncGridColumn<T, S>[]
  visibleColumns: RncGridColumn<T, S>[]
  overflowColumns: RncGridColumn<T, S>[]
  hasOverflow: boolean
  resolvedColumnTypes: Map<string, RncGridColumnType>
  containerProps: ContainerBindProps

  // Pagination
  paged: boolean
  pagination: RncGridPagination
  setPagination: Dispatch<SetStateAction<RncGridPagination>>

  // Sorting
  sort: RncGridSort<S>[]
  sortableColumns: RncGridColumn<T, S>[]
  activeSortColumn: RncGridColumn<T, S> | undefined
  handleSortSelection: (sortKey: S) => void
  getSortIndex: (sortKey: S) => number
  getSortDirection: (sortKey: S) => "ASC" | "DESC" | undefined
  sortPanelOpen: boolean
  setSortPanelOpen: Dispatch<SetStateAction<boolean>>

  // Filtering
  filtersConfig: RncGridFiltersConfig<T, F> | undefined
  filtersExpanded: boolean
  setFiltersExpanded: Dispatch<SetStateAction<boolean>>
  filterValues: F
  activeFilterCount: number
  clearFilters: () => void
  handleFilterLoad: () => Promise<Partial<F>>
  handleFilterOnLoad: (methods: UseFormReturn) => Promise<void>
  handleFilterValuesChange: (methods: UseFormReturn) => Promise<void>
  openMobileFilters: () => void
  handleMobileSheetOpenChange: (open: boolean) => void
  applyFilters: () => void
  clearMobileFilters: () => void

  // Selection
  selectable: boolean
  singleSelection: boolean
  rowClickable: boolean
  showSelectionBar: boolean
  allSelected: boolean
  someSelected: boolean
  selectedCount: number
  isRowSelected: (row: T, index: number) => boolean
  toggleRowSelection: (row: T, index: number) => void
  toggleSelectAll: () => void
  clearSelection: () => void
  getSelectedRows: () => T[]
  bulkActions: RncGridBulkAction<T>[] | undefined

  // Row actions
  actions: RncGridActions<T> | undefined
  hasActions: boolean
  actionsWidth: number
  handleViewPress: (row: T) => void
  handleEditPress: (row: T) => void
  handleDeletePress: (row: T) => void

  // Inline editing
  addEditMode: "default" | "inline" | "modal"
  inlineEdit: RncGridInlineEditConfig<T> | undefined
  isDraftRow: (row: T) => boolean
  isRowEditing: (row: T, index: number) => boolean
  cancelEditingRow: (row: T, index: number) => void
  saveEditingRow: (
    row: T,
    index: number,
    formValues: Record<string, unknown>
  ) => Promise<boolean>

  // Inline edit mode 'all' — dirty tracking
  registerRowForm: (rowKey: string | number, methods: UseFormReturn) => void
  handleRowFormChange: (rowKey: string | number) => void
  handleDraftFormChange: (rowKey: string | number) => void
  dirtyRowCount: number
  isRowDirty: (rowKey: string | number) => boolean
  discardRow: (rowKey: string | number) => void
  saveAllDirtyRows: () => Promise<void>
  resetAllDirtyRows: () => void

  // Modal editing
  modalEdit: RncGridModalEditConfig<T> | undefined
  modalEditRow: T | null
  closeModalEdit: () => void
  saveModalEdit: (formData: Record<string, unknown>) => Promise<boolean>

  // Delete dialog
  deleteTarget: T | null
  confirmDelete: () => void
  cancelDelete: () => void
  deleteDialogTitle: string
  deleteDialogDescription: string

  // Inline edit discard confirmation
  discardConfirmOpen: boolean
  discardConfirmMessage: string
  confirmDiscardRefetch: () => void
  cancelDiscardRefetch: () => void

  // Expand/collapse
  expandableRender: ((row: T) => ReactNode) | undefined
  toggleRowExpanded: (rowKey: string | number) => void
  isRowExpanded: (rowKey: string | number) => boolean

  // Toolbar
  toolbar: RncGridToolbar | undefined
  hasToolbar: boolean
  handleReset: () => void
  handleAddPress: () => void
}

const RncGridContext = createContext<RncGridContextValue<
  unknown,
  unknown,
  Record<string, unknown>
> | null>(null)

export function useRncGridContext<
  T = unknown,
  S = unknown,
  F extends Record<string, unknown> = Record<string, unknown>,
>(): RncGridContextValue<T, S, F> {
  const ctx = useContext(RncGridContext)
  if (!ctx) {
    throw new Error("useRncGridContext must be used within RncGridProvider")
  }
  return ctx as RncGridContextValue<T, S, F>
}

export function RncGridProvider<
  T,
  S,
  F extends Record<string, unknown> = Record<string, unknown>,
>({
  props,
  children,
}: Readonly<{
  props: Readonly<RncGridProps<T, S, F>>
  children: ReactNode
}>) {
  const state = useRncGridState(props)
  return (
    <RncGridContext.Provider
      value={
        state as unknown as RncGridContextValue<
          unknown,
          unknown,
          Record<string, unknown>
        >
      }
    >
      {children}
    </RncGridContext.Provider>
  )
}
