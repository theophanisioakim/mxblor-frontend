import type { ReactNode } from "react"
import type { RncInputProps } from "../../form-components/rnc-input/rnc-input-model"

export type RncGridColumnType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "datetime"
  | "time"

/** Button variants accepted by toolbar custom actions (maps to the `Button` primitive). */
export type RncGridButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link"

export interface RncGridInlineEditConfig<T> {
  mode: "row" | "all"
  onSave: (row: T, updatedValues: Partial<T>) => Promise<boolean>
  onSaveAll?: (
    entries: { row: T; updatedValues: Partial<T> }[]
  ) => Promise<boolean>
  onCancel?: (row: T) => void
  /** Creates a local draft row for inline add (row mode). Not persisted until saved. */
  createDraftRow?: () => T
  /** Defaults to {@link isRncGridDraftRow} when omitted. */
  isDraftRow?: (row: T) => boolean
  /** Shown before discarding unsaved inline edits when a refetch is triggered. */
  discardConfirm?: string
}

export interface RncGridModalEditConfig<T> {
  title?: string | ((row: T) => string)
  renderFields: (row: T) => ReactNode
  onSave: (row: T, formData: Record<string, unknown>) => Promise<boolean>
  onCancel?: (row: T) => void
  loadFormValues?: (row: T) => Promise<Record<string, unknown>>
  maxWidth?: number
  dismissable?: boolean
}

export interface RncGridSort<S> {
  field: S
  direction: "ASC" | "DESC"
}

export interface RncGridEditAction<T> {
  route?: string | ((row: T) => string)
  onPress?: (row: T) => void
  /** When it returns true for a row, the edit action is not rendered for that
   * row (e.g. read-only / system-default rows). */
  hidden?: (row: T) => boolean
}

export interface RncGridDeleteConfirm<T> {
  title?: string
  description?: string | ((row: T) => string)
}

export interface RncGridDeleteAction<T> {
  onPress: (row: T) => void | Promise<void>
  confirm?: boolean | RncGridDeleteConfirm<T>
  /** When it returns true for a row, the delete action is not rendered for that
   * row (e.g. read-only / system-default rows). */
  hidden?: (row: T) => boolean
}

export interface RncGridCustomAction<T> {
  key: string
  icon?: ReactNode
  label: string
  onPress: (row: T) => void
}

export interface RncGridActions<T> {
  edit?: RncGridEditAction<T>
  delete?: RncGridDeleteAction<T>
  custom?: RncGridCustomAction<T>[]
}

export interface RncGridToolbarAddAction {
  route?: string
  onPress?: () => void
  label?: string
}

export interface RncGridToolbarRefreshAction {
  onPress?: () => void
  label?: string
  confirm?: string
}

export interface RncGridToolbarResetAction {
  onPress?: () => void
  label?: string
  confirm?: string
}

export interface RncGridToolbarCustomAction {
  key: string
  icon?: ReactNode
  label: string
  onPress: () => void
  disabled?: boolean
  variant?: RncGridButtonVariant
}

export interface RncGridToolbar {
  add?: RncGridToolbarAddAction
  refresh?: RncGridToolbarRefreshAction
  reset?: RncGridToolbarResetAction
  custom?: RncGridToolbarCustomAction[]
}

export interface RncGridBulkAction<T> {
  key: string
  icon?: ReactNode
  label: string
  onPress: (selectedRows: T[]) => void | Promise<void>
}

export interface RncGridSelectionConfig<T> {
  single?: boolean
  persist?: boolean
  rowClickable?: boolean
  showSelectionBar?: boolean
  resolveSelectedKeys?: (data: T[]) => (string | number)[]
  onChange?: (selectedRows: T[]) => void
  bulkActions?: RncGridBulkAction<T>[]
}

export interface RncGridColumn<T, S> {
  key: string
  header: string
  renderCell?: (row: T, rowIndex: number) => ReactNode
  renderEditCell?: (row: T, rowIndex: number) => ReactNode
  type?: RncGridColumnType
  editable?: boolean
  nullable?: boolean
  minWidth?: number
  sortable?: boolean
  sortKey?: S
  priority?: number
  required?: boolean
  numberValidationRules?: RncInputProps["numberValidationRules"]
}

export interface RncGridPagination {
  pageNumber: number
  pageSize: number
  pageSizeOptions: number[]
  type: "default" | "infinite"
}

export interface RncGridDataPagination {
  isEmpty: boolean
  isFirst: boolean
  isLast: boolean
  currentPageNumber: number
  currentPageElementsSize: number
  currentPageSize: number
  totalElements: number
  totalPages: number
}

export interface RncGridData<T> {
  data: T[]
  pagination: RncGridDataPagination
}

export interface RncGridFetchDataParams<S, F = Record<string, unknown>> {
  pagination?: RncGridPagination
  sort: RncGridSort<S>[]
  filters: F
  signal?: AbortSignal
}

export interface RncGridExpandableConfig<T> {
  render?: (row: T) => ReactNode
  single?: boolean
}

export interface RncGridFiltersConfig<T, F> {
  render?: ReactNode
  defaultValues?: Partial<F>
  persistent?: Partial<F>
  clientFilter?: (row: T, filters: F) => boolean
}

export interface RncGridProps<
  T,
  S,
  F extends Record<string, unknown> = Record<string, unknown>,
> {
  id: string
  keyExtractor: (row: T, index: number) => string | number
  columns: RncGridColumn<T, S>[]
  fetchData: (params: RncGridFetchDataParams<S, F>) => Promise<RncGridData<T>>
  addEditMode: "default" | "inline" | "modal"
  initialSort: RncGridSort<S>[]
  initialPagination?: RncGridPagination
  actions?: RncGridActions<T>
  toolbar?: RncGridToolbar
  selection?: RncGridSelectionConfig<T>
  inlineEdit?: RncGridInlineEditConfig<T>
  modalEdit?: RncGridModalEditConfig<T>
  expandable?: RncGridExpandableConfig<T>
  filters?: RncGridFiltersConfig<T, F>
  refreshTrigger?: number
  clientSide?: boolean
  /**
   * Navigation handler for the `route`-based edit/add actions. `@workspace/ui`
   * cannot depend on `@workspace/router` (it would invert the dependency
   * graph), so consumers wire it — e.g. `onNavigate={useRouter().push}`. When a
   * `route` is configured without `onNavigate`, navigation is a no-op.
   */
  onNavigate?: (href: string) => void
}
