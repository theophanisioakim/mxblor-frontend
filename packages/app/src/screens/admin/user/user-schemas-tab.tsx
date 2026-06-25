"use client"

import {
  getSbfUserSchemasWithUnassigned,
  type SbfUserSchemaCreateRequestDto,
  type SbfUserSchemaWithSchemaDescriptionResponseDto,
  useBulkSbfUserSchemas,
} from "@workspace/api-client"
import {
  Icon,
  RncGrid,
  type RncGridColumn,
  type RncGridData,
  type RncGridFetchDataParams,
  type RncGridFiltersConfig,
  type RncGridSelectionConfig,
  type RncGridToolbar,
  RncInput,
  Save,
  View,
} from "@workspace/ui"
import { useCallback, useMemo, useRef, useState } from "react"

type UserSchemaRow = SbfUserSchemaWithSchemaDescriptionResponseDto
type UserSchemaFilters = { schemaName: string; schemaDescription: string }

export function UserSchemasTab({
  userId,
  onDirtyChange,
}: Readonly<{
  userId: string
  onDirtyChange?: (dirty: boolean) => void
}>) {
  const bulkMutation = useBulkSbfUserSchemas()
  const initSelectedRows = useRef<UserSchemaRow[]>([])
  const [selectedRows, setSelectedRows] = useState<UserSchemaRow[]>([])
  const [isDirty, setIsDirty] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const setDirtyState = useCallback(
    (dirty: boolean) => {
      setIsDirty(dirty)
      onDirtyChange?.(dirty)
    },
    [onDirtyChange]
  )

  const fetchData = useCallback(
    async (
      params: RncGridFetchDataParams<string>
    ): Promise<RncGridData<UserSchemaRow>> => {
      const userSchemas =
        (await getSbfUserSchemasWithUnassigned(userId, params.signal)) ?? []

      const assignedRows: UserSchemaRow[] = []
      for (const userSchema of userSchemas) {
        if (userSchema.id != null && userSchema.schemaId != null) {
          assignedRows.push(userSchema)
        }
      }
      initSelectedRows.current = assignedRows
      setSelectedRows(assignedRows)
      setDirtyState(false)

      return {
        data: userSchemas,
        pagination: {
          isEmpty: userSchemas.length === 0,
          isFirst: true,
          isLast: true,
          currentPageNumber: 0,
          currentPageElementsSize: userSchemas.length,
          currentPageSize: userSchemas.length,
          totalElements: userSchemas.length,
          totalPages: 1,
        },
      }
    },
    [userId, setDirtyState]
  )

  const columns: RncGridColumn<UserSchemaRow, string>[] = useMemo(
    () => [
      {
        key: "schemaName",
        header: "Schema",
        minWidth: 160,
        sortable: true,
        sortKey: "schemaName",
        type: "string",
        editable: false,
        priority: 1,
      },
      {
        key: "schemaDescription",
        header: "Description",
        minWidth: 200,
        sortable: true,
        sortKey: "schemaDescription",
        type: "string",
        editable: false,
        priority: 2,
      },
      {
        key: "createdAt",
        header: "Created At",
        minWidth: 160,
        sortable: true,
        sortKey: "createdAt",
        type: "datetime",
        editable: false,
        priority: 3,
      },
      {
        key: "createdBy",
        header: "Created By",
        minWidth: 140,
        sortable: true,
        sortKey: "createdBy",
        type: "string",
        editable: false,
        priority: 4,
      },
    ],
    []
  )

  const handleSelectionChange = useCallback(
    (rows: UserSchemaRow[]) => {
      setSelectedRows(rows)
      const currentIds = new Set(
        rows.map((r) => r.schemaId).filter((id): id is string => id != null)
      )
      const initialIds = new Set(
        initSelectedRows.current
          .map((r) => r.schemaId)
          .filter((id): id is string => id != null)
      )
      const dirty =
        currentIds.size !== initialIds.size ||
        [...currentIds].some((id) => !initialIds.has(id))
      setDirtyState(dirty)
    },
    [setDirtyState]
  )

  const keyExtractor = useCallback(
    (row: UserSchemaRow) => row.schemaId ?? "",
    []
  )

  const selection: RncGridSelectionConfig<UserSchemaRow> = useMemo(
    () => ({
      persist: true,
      resolveSelectedKeys: (data) =>
        data.filter((r) => r.id != null).map((r) => r.schemaId ?? ""),
      onChange: handleSelectionChange,
      rowClickable: true,
      showSelectionBar: false,
    }),
    [handleSelectionChange]
  )

  const handleSave = useCallback(async () => {
    const createRequests: SbfUserSchemaCreateRequestDto[] = []
    for (const selectedRow of selectedRows) {
      if (selectedRow.id || !selectedRow.schemaId) continue
      createRequests.push({ userId, schemaId: selectedRow.schemaId })
    }

    const deleteRequests: string[] = []
    for (const initialSelectedRow of initSelectedRows.current) {
      if (
        selectedRows.some(
          (selectedRow) => selectedRow.id === initialSelectedRow.id
        )
      ) {
        continue
      }
      if (initialSelectedRow.id) deleteRequests.push(initialSelectedRow.id)
    }

    if (createRequests.length === 0 && deleteRequests.length === 0) return

    await bulkMutation.mutateAsync({
      data: {
        createRequests: createRequests.length > 0 ? createRequests : undefined,
        deleteRequests: deleteRequests.length > 0 ? deleteRequests : undefined,
      },
    })
    setDirtyState(false)
    setRefreshTrigger((c) => c + 1)
  }, [userId, selectedRows, bulkMutation, setDirtyState])

  const toolbar: RncGridToolbar = useMemo(
    () => ({
      reset: {
        confirm: isDirty
          ? "You have unsaved changes. Resetting will discard them. Continue?"
          : undefined,
      },
      custom: [
        {
          key: "save",
          label: bulkMutation.isPending ? "Saving..." : "Save",
          icon: <Icon as={Save} size={16} />,
          onPress: handleSave,
          disabled: !isDirty || bulkMutation.isPending,
          variant: "default",
        },
      ],
    }),
    [handleSave, isDirty, bulkMutation.isPending]
  )

  const filters: RncGridFiltersConfig<UserSchemaRow, UserSchemaFilters> =
    useMemo(
      () => ({
        render: (
          <View className="gap-3 md:flex-row md:flex-wrap">
            <View className="md:min-w-[200px] md:flex-1">
              <RncInput
                id="schemaName"
                label="Schema"
                placeholder="Search schema..."
              />
            </View>
            <View className="md:min-w-[200px] md:flex-1">
              <RncInput
                id="schemaDescription"
                label="Description"
                placeholder="Search description..."
              />
            </View>
          </View>
        ),
        clientFilter: (row, f) => {
          if (
            f.schemaName &&
            !row.schemaName?.toLowerCase().includes(f.schemaName.toLowerCase())
          ) {
            return false
          }
          if (
            f.schemaDescription &&
            !row.schemaDescription
              ?.toLowerCase()
              .includes(f.schemaDescription.toLowerCase())
          ) {
            return false
          }
          return true
        },
      }),
      []
    )

  return (
    <RncGrid<UserSchemaRow, string, UserSchemaFilters>
      id={`user-schemas-${userId}`}
      columns={columns}
      fetchData={fetchData}
      keyExtractor={keyExtractor}
      addEditMode="default"
      initialSort={[]}
      selection={selection}
      toolbar={toolbar}
      refreshTrigger={refreshTrigger}
      clientSide
      filters={filters}
    />
  )
}
