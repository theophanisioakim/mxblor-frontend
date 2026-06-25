"use client"

import {
  type SbfUserResponseDto,
  type SbfUserSearchRequestDto,
  SbfUserSortOrderField,
  searchSbfUsers,
  useDeleteSbfUser,
} from "@workspace/api-client"
import { useRouter } from "@workspace/router"
import {
  Icon,
  RncCheckbox,
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
import { useCallback, useMemo } from "react"

type UserListFilters = Omit<SbfUserSearchRequestDto, "page" | "size" | "sort">

export function UserListScreen() {
  const router = useRouter()
  const deleteMutation = useDeleteSbfUser()

  const fetchData = useCallback(
    async (
      params: RncGridFetchDataParams<SbfUserSortOrderField, UserListFilters>
    ): Promise<RncGridData<SbfUserResponseDto>> => {
      const payload: SbfUserSearchRequestDto = {
        page: params.pagination?.pageNumber ?? 0,
        size: params.pagination?.pageSize ?? 20,
        sort: params.sort,
        ...params.filters,
      }
      const apiResponse = await searchSbfUsers(payload, params.signal)
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

  const columns: RncGridColumn<SbfUserResponseDto, SbfUserSortOrderField>[] =
    useMemo(
      () => [
        {
          key: "username",
          header: "Username",
          minWidth: 120,
          sortable: true,
          sortKey: "USERNAME",
          type: "string",
          editable: false,
          priority: 1,
        },
        {
          key: "active",
          header: "Active",
          minWidth: 70,
          sortable: true,
          sortKey: "ACTIVE",
          type: "boolean",
          editable: false,
          priority: 2,
        },
        {
          key: "shouldUpdatePassword",
          header: "Should update password",
          minWidth: 70,
          sortable: true,
          sortKey: "SHOULDUPDATEPASSWORD",
          type: "boolean",
          editable: false,
          priority: 7,
        },
        {
          key: "createdAt",
          header: "Created At",
          minWidth: 100,
          sortable: true,
          sortKey: "CREATED_AT",
          type: "datetime",
          editable: false,
          priority: 8,
        },
        {
          key: "createdBy",
          header: "Created By",
          minWidth: 100,
          sortable: true,
          sortKey: "CREATED_BY",
          type: "string",
          editable: false,
          priority: 9,
        },
        {
          key: "updatedAt",
          header: "Updated At",
          minWidth: 100,
          sortable: true,
          sortKey: "UPDATED_AT",
          type: "datetime",
          editable: false,
          priority: 10,
        },
        {
          key: "updatedBy",
          header: "Updated By",
          minWidth: 100,
          sortable: true,
          sortKey: "UPDATED_BY",
          type: "string",
          editable: false,
          priority: 11,
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
              id="username"
              label="Username"
              placeholder="Search username..."
            />
          </View>
        </View>
        <View className="gap-3 md:flex-row md:flex-wrap md:gap-4">
          <RncCheckbox id="active" label="Active" nullable />
        </View>
      </View>
    ),
    []
  )

  const selection: RncGridSelectionConfig<SbfUserResponseDto> = useMemo(
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
          },
        },
      ],
    }),
    [deleteMutation]
  )

  const actions: RncGridActions<SbfUserResponseDto> = useMemo(
    () => ({
      edit: {
        route: (row) => `/admin/user/${row.id}`,
      },
      delete: {
        onPress: async (row) => {
          if (!row.id) return
          await deleteMutation.mutateAsync({ id: row.id })
        },
        confirm: {
          title: "Delete User",
          description: (row) =>
            `Are you sure you want to delete user "${row.username}"? This action cannot be undone.`,
        },
      },
    }),
    [deleteMutation]
  )

  return (
    <View className="w-full gap-4 self-center p-4 md:p-6 lg:py-8">
      <Text className="font-bold text-2xl text-foreground md:text-3xl">
        Users
      </Text>

      <RncGrid<SbfUserResponseDto, SbfUserSortOrderField, UserListFilters>
        id="user-list"
        columns={columns}
        fetchData={fetchData}
        keyExtractor={(row) => row.id ?? ""}
        addEditMode="default"
        initialSort={[
          { field: SbfUserSortOrderField.CREATED_AT, direction: "DESC" },
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
          add: { route: "/admin/user/new", label: "Add User" },
          refresh: {},
          reset: {},
        }}
        onNavigate={router.push}
      />
    </View>
  )
}
