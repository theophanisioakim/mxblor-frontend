"use client"

import {
  type SbfRoleResponseDto,
  type SbfRoleSearchRequestDto,
  SbfRoleSortOrderField,
  searchSbfRoles,
  useDeleteSbfRole,
} from "@workspace/api-client"
import { useRouter } from "@workspace/router"
import {
  Icon,
  RncGrid,
  type RncGridActions,
  type RncGridColumn,
  type RncGridData,
  type RncGridFetchDataParams,
  type RncGridSelectionConfig,
  RncInput,
  Text,
  Trash2,
  View,
} from "@workspace/ui"
import { useCallback, useMemo, useState } from "react"

type RoleListFilters = Omit<SbfRoleSearchRequestDto, "page" | "size" | "sort">

export function RoleListScreen() {
  const router = useRouter()
  const deleteMutation = useDeleteSbfRole()
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const fetchData = useCallback(
    async (
      params: RncGridFetchDataParams<SbfRoleSortOrderField, RoleListFilters>
    ): Promise<RncGridData<SbfRoleResponseDto>> => {
      const payload: SbfRoleSearchRequestDto = {
        page: params.pagination?.pageNumber ?? 0,
        size: params.pagination?.pageSize ?? 20,
        sort: params.sort,
        ...params.filters,
      }
      const apiResponse = await searchSbfRoles(payload, params.signal)
      return {
        data: apiResponse.content ?? [],
        pagination: {
          isEmpty: apiResponse.empty ?? true,
          isFirst: apiResponse.first ?? true,
          isLast: apiResponse.last ?? true,
          currentPageNumber: apiResponse.number ?? 0,
          currentPageElementsSize: apiResponse.numberOfElements ?? 0,
          currentPageSize: apiResponse.size ?? 0,
          totalElements: apiResponse.totalElements ?? 0,
          totalPages: apiResponse.totalPages ?? 0,
        },
      }
    },
    []
  )

  const columns: RncGridColumn<SbfRoleResponseDto, SbfRoleSortOrderField>[] =
    useMemo(
      () => [
        {
          key: "description",
          header: "Description",
          minWidth: 200,
          sortable: true,
          sortKey: "DESCRIPTION",
          type: "string",
          editable: false,
          priority: 2,
        },
        {
          key: "createdAt",
          header: "Created At",
          minWidth: 100,
          sortable: true,
          sortKey: "CREATED_AT",
          type: "datetime",
          editable: false,
          priority: 3,
        },
        {
          key: "createdBy",
          header: "Created By",
          minWidth: 100,
          sortable: true,
          sortKey: "CREATED_BY",
          type: "string",
          editable: false,
          priority: 4,
        },
        {
          key: "updatedAt",
          header: "Updated At",
          minWidth: 100,
          sortable: true,
          sortKey: "UPDATED_AT",
          type: "datetime",
          editable: false,
          priority: 5,
        },
        {
          key: "updatedBy",
          header: "Updated By",
          minWidth: 100,
          sortable: true,
          sortKey: "UPDATED_BY",
          type: "string",
          editable: false,
          priority: 6,
        },
      ],
      []
    )

  const filters = useMemo(
    () => (
      <View className="gap-4">
        <View className="gap-3 md:flex-row md:flex-wrap">
          <View className="md:min-w-[200px] md:flex-1">
            <RncInput
              id="description"
              label="Description"
              placeholder="Search description..."
            />
          </View>
        </View>
      </View>
    ),
    []
  )

  const selection: RncGridSelectionConfig<SbfRoleResponseDto> = useMemo(
    () => ({
      persist: true,
      rowClickable: true,
      bulkActions: [
        {
          key: "delete-selected",
          icon: <Icon as={Trash2} size={16} />,
          label: "Delete selected",
          onPress: async (rows) => {
            await Promise.all(
              rows
                .filter((row) => row.id)
                .map((row) =>
                  deleteMutation.mutateAsync({ id: row.id as string })
                )
            )
            setRefreshTrigger((c) => c + 1)
          },
        },
      ],
    }),
    [deleteMutation]
  )

  const actions: RncGridActions<SbfRoleResponseDto> = useMemo(
    () => ({
      edit: {
        route: (row) => `/admin/role/${row.id}`,
      },
      delete: {
        onPress: async (row) => {
          if (!row.id) return
          await deleteMutation.mutateAsync({ id: row.id })
          setRefreshTrigger((c) => c + 1)
        },
        confirm: {
          title: "Delete Role",
          description: (row) =>
            `Are you sure you want to delete role "${row.description}"? This action cannot be undone.`,
        },
      },
    }),
    [deleteMutation]
  )

  return (
    <View className="w-full gap-4 self-center p-4 md:p-6 lg:py-8">
      <Text className="font-bold text-2xl text-foreground md:text-3xl">
        Roles
      </Text>

      <RncGrid<SbfRoleResponseDto, SbfRoleSortOrderField, RoleListFilters>
        id="role-list"
        columns={columns}
        fetchData={fetchData}
        keyExtractor={(row) => row.id ?? ""}
        addEditMode="default"
        initialSort={[
          { field: SbfRoleSortOrderField.CREATED_AT, direction: "DESC" },
        ]}
        initialPagination={{
          type: "default",
          pageSize: 20,
          pageNumber: 0,
          pageSizeOptions: [20, 50, 100],
        }}
        actions={actions}
        selection={selection}
        filters={{ render: filters }}
        toolbar={{
          add: { route: "/admin/role/new", label: "Add Role" },
          refresh: {},
          reset: {},
        }}
        refreshTrigger={refreshTrigger}
        onNavigate={router.push}
      />
    </View>
  )
}
