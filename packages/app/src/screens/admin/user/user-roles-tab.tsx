"use client"

import {
  getSbfUserRolesWithUnassigned,
  type SbfUserRoleCreateRequestDto,
  type SbfUserRoleWithRoleDescriptionResponseDto,
  useBulkSbfUserRoles,
} from "@workspace/api-client"
import { usePermission } from "@workspace/providers"
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
import { bulkSavePermissions } from "../../screen-permissions"

type UserRoleRow = SbfUserRoleWithRoleDescriptionResponseDto
type UserRoleFilters = { roleDescription: string }

export function UserRolesTab({
  userId,
  onDirtyChange,
}: Readonly<{
  userId: string
  onDirtyChange?: (dirty: boolean) => void
}>) {
  const bulkMutation = useBulkSbfUserRoles()
  const { hasPermission } = usePermission()
  const canSave = hasPermission(bulkSavePermissions.userRole)
  const initSelectedRows = useRef<UserRoleRow[]>([])
  const [selectedRows, setSelectedRows] = useState<UserRoleRow[]>([])
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
    ): Promise<RncGridData<UserRoleRow>> => {
      const userRoles =
        (await getSbfUserRolesWithUnassigned(userId, params.signal)) ?? []

      const assignedRows: UserRoleRow[] = []
      for (const userRole of userRoles) {
        if (userRole.id != null && userRole.roleId != null) {
          assignedRows.push(userRole)
        }
      }
      initSelectedRows.current = assignedRows
      setSelectedRows(assignedRows)
      setDirtyState(false)

      return {
        data: userRoles,
        pagination: {
          isEmpty: userRoles.length === 0,
          isFirst: true,
          isLast: true,
          currentPageNumber: 0,
          currentPageElementsSize: userRoles.length,
          currentPageSize: userRoles.length,
          totalElements: userRoles.length,
          totalPages: 1,
        },
      }
    },
    [userId, setDirtyState]
  )

  const columns: RncGridColumn<UserRoleRow, string>[] = useMemo(
    () => [
      {
        key: "roleDescription",
        header: "Role",
        minWidth: 160,
        sortable: true,
        sortKey: "roleDescription",
        type: "string",
        editable: false,
        priority: 1,
      },
      {
        key: "createdAt",
        header: "Created At",
        minWidth: 160,
        sortable: true,
        sortKey: "createdAt",
        type: "datetime",
        editable: false,
        priority: 2,
      },
      {
        key: "createdBy",
        header: "Created By",
        minWidth: 140,
        sortable: true,
        sortKey: "createdBy",
        type: "string",
        editable: false,
        priority: 3,
      },
    ],
    []
  )

  const handleSelectionChange = useCallback(
    (rows: UserRoleRow[]) => {
      setSelectedRows(rows)
      const currentIds = new Set(
        rows.map((r) => r.roleId).filter((id): id is string => id != null)
      )
      const initialIds = new Set(
        initSelectedRows.current
          .map((r) => r.roleId)
          .filter((id): id is string => id != null)
      )
      const dirty =
        currentIds.size !== initialIds.size ||
        [...currentIds].some((id) => !initialIds.has(id))
      setDirtyState(dirty)
    },
    [setDirtyState]
  )

  const keyExtractor = useCallback((row: UserRoleRow) => row.roleId ?? "", [])

  const selection: RncGridSelectionConfig<UserRoleRow> = useMemo(
    () => ({
      persist: true,
      resolveSelectedKeys: (data) =>
        data.filter((r) => r.id != null).map((r) => r.roleId ?? ""),
      onChange: handleSelectionChange,
      rowClickable: true,
      showSelectionBar: false,
    }),
    [handleSelectionChange]
  )

  const handleSave = useCallback(async () => {
    const createRequests: SbfUserRoleCreateRequestDto[] = []
    for (const selectedRow of selectedRows) {
      if (selectedRow.id || !selectedRow.roleId) continue
      createRequests.push({ userId, roleId: selectedRow.roleId })
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
          disabled: !canSave || !isDirty || bulkMutation.isPending,
          variant: "default",
        },
      ],
    }),
    [handleSave, isDirty, bulkMutation.isPending, canSave]
  )

  const filters: RncGridFiltersConfig<UserRoleRow, UserRoleFilters> = useMemo(
    () => ({
      render: (
        <View className="gap-3 md:flex-row md:flex-wrap">
          <View className="md:min-w-[200px] md:flex-1">
            <RncInput
              id="roleDescription"
              label="Role"
              placeholder="Search role..."
            />
          </View>
        </View>
      ),
      clientFilter: (row, f) => {
        if (
          f.roleDescription &&
          !row.roleDescription
            ?.toLowerCase()
            .includes(f.roleDescription.toLowerCase())
        ) {
          return false
        }
        return true
      },
    }),
    []
  )

  return (
    <RncGrid<UserRoleRow, string, UserRoleFilters>
      id={`user-roles-${userId}`}
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
