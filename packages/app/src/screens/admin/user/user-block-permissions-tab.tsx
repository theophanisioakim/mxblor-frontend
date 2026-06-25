"use client"

import {
  getSbfUserBlockPermissionsWithUnassigned,
  type SbfUserBlockPermissionCreateRequestDto,
  type SbfUserBlockPermissionWithPermissionDescriptionResponseDto,
  useBulkSbfUserBlockPermissions,
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

type BlockPermissionRow =
  SbfUserBlockPermissionWithPermissionDescriptionResponseDto
type BlockPermissionFilters = {
  permissionAlias: string
  permissionDescription: string
}

export function UserBlockPermissionsTab({
  userId,
  onDirtyChange,
}: Readonly<{
  userId: string
  onDirtyChange?: (dirty: boolean) => void
}>) {
  const bulkMutation = useBulkSbfUserBlockPermissions()
  const initSelectedRows = useRef<BlockPermissionRow[]>([])
  const [selectedRows, setSelectedRows] = useState<BlockPermissionRow[]>([])
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
    ): Promise<RncGridData<BlockPermissionRow>> => {
      const permissions =
        (await getSbfUserBlockPermissionsWithUnassigned(
          userId,
          params.signal
        )) ?? []

      const assignedRows: BlockPermissionRow[] = []
      for (const perm of permissions) {
        if (perm.id != null && perm.permissionId != null) {
          assignedRows.push(perm)
        }
      }
      initSelectedRows.current = assignedRows
      setSelectedRows(assignedRows)
      setDirtyState(false)

      return {
        data: permissions,
        pagination: {
          isEmpty: permissions.length === 0,
          isFirst: true,
          isLast: true,
          currentPageNumber: 0,
          currentPageElementsSize: permissions.length,
          currentPageSize: permissions.length,
          totalElements: permissions.length,
          totalPages: 1,
        },
      }
    },
    [userId, setDirtyState]
  )

  const columns: RncGridColumn<BlockPermissionRow, string>[] = useMemo(
    () => [
      {
        key: "permissionAlias",
        header: "Permission",
        minWidth: 160,
        sortable: true,
        sortKey: "permissionAlias",
        type: "string",
        editable: false,
        priority: 1,
      },
      {
        key: "permissionDescription",
        header: "Description",
        minWidth: 200,
        sortable: true,
        sortKey: "permissionDescription",
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
    (rows: BlockPermissionRow[]) => {
      setSelectedRows(rows)
      const currentIds = new Set(
        rows.map((r) => r.permissionId).filter((id): id is string => id != null)
      )
      const initialIds = new Set(
        initSelectedRows.current
          .map((r) => r.permissionId)
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
    (row: BlockPermissionRow) => row.permissionId ?? "",
    []
  )

  const selection: RncGridSelectionConfig<BlockPermissionRow> = useMemo(
    () => ({
      persist: true,
      resolveSelectedKeys: (data) =>
        data.filter((r) => r.id != null).map((r) => r.permissionId ?? ""),
      onChange: handleSelectionChange,
      rowClickable: true,
      showSelectionBar: false,
    }),
    [handleSelectionChange]
  )

  const handleSave = useCallback(async () => {
    const createRequests: SbfUserBlockPermissionCreateRequestDto[] = []
    for (const selectedRow of selectedRows) {
      if (selectedRow.id || !selectedRow.permissionId) continue
      createRequests.push({ userId, permissionId: selectedRow.permissionId })
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

  const filters: RncGridFiltersConfig<
    BlockPermissionRow,
    BlockPermissionFilters
  > = useMemo(
    () => ({
      render: (
        <View className="gap-3 md:flex-row md:flex-wrap">
          <View className="md:min-w-[200px] md:flex-1">
            <RncInput
              id="permissionAlias"
              label="Permission"
              placeholder="Search permission..."
            />
          </View>
          <View className="md:min-w-[200px] md:flex-1">
            <RncInput
              id="permissionDescription"
              label="Description"
              placeholder="Search description..."
            />
          </View>
        </View>
      ),
      clientFilter: (row, f) => {
        if (
          f.permissionAlias &&
          !row.permissionAlias
            ?.toLowerCase()
            .includes(f.permissionAlias.toLowerCase())
        ) {
          return false
        }
        if (
          f.permissionDescription &&
          !row.permissionDescription
            ?.toLowerCase()
            .includes(f.permissionDescription.toLowerCase())
        ) {
          return false
        }
        return true
      },
    }),
    []
  )

  return (
    <RncGrid<BlockPermissionRow, string, BlockPermissionFilters>
      id={`user-block-perms-${userId}`}
      columns={columns}
      fetchData={fetchData}
      keyExtractor={keyExtractor}
      addEditMode="default"
      initialSort={[]}
      initialPagination={{
        type: "default",
        pageSize: 20,
        pageNumber: 0,
        pageSizeOptions: [20, 50, 100],
      }}
      selection={selection}
      toolbar={toolbar}
      refreshTrigger={refreshTrigger}
      clientSide
      filters={filters}
    />
  )
}
