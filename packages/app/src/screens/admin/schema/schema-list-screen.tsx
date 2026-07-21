"use client"

import {
  type SbfSchemaResponseDto,
  type SbfSchemaSearchRequestDto,
  SbfSchemaSortOrderField,
  searchSbfSchemas,
  useDeleteSbfSchema,
} from "@workspace/api-client"
import { useCrudPermissions } from "@workspace/providers"
import { useRouter } from "@workspace/router"
import {
  RncCheckbox,
  RncGrid,
  type RncGridActions,
  type RncGridColumn,
  type RncGridData,
  type RncGridFetchDataParams,
  RncInput,
  Text,
  View,
} from "@workspace/ui"
import { useCallback, useMemo } from "react"
import { PermissionGuard } from "../../permission-guard"
import { crudPermissions, viewPermissions } from "../../screen-permissions"

type SchemaListFilters = Omit<
  SbfSchemaSearchRequestDto,
  "page" | "size" | "sort"
>

export function SchemaListScreen() {
  const router = useRouter()
  const deleteMutation = useDeleteSbfSchema()
  const { canCreate, canUpdate, canDelete } = useCrudPermissions(
    crudPermissions.schema
  )

  const fetchData = useCallback(
    async (
      params: RncGridFetchDataParams<SbfSchemaSortOrderField, SchemaListFilters>
    ): Promise<RncGridData<SbfSchemaResponseDto>> => {
      const payload: SbfSchemaSearchRequestDto = {
        page: params.pagination?.pageNumber ?? 0,
        size: params.pagination?.pageSize ?? 20,
        sort: params.sort,
        ...params.filters,
      }
      const apiResponse = await searchSbfSchemas(payload, params.signal)
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

  const columns: RncGridColumn<
    SbfSchemaResponseDto,
    SbfSchemaSortOrderField
  >[] = useMemo(
    () => [
      {
        key: "name",
        header: "Name",
        minWidth: 150,
        sortable: true,
        sortKey: "NAME",
        type: "string",
        editable: false,
        priority: 1,
      },
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
        key: "active",
        header: "Active",
        minWidth: 70,
        sortable: true,
        sortKey: "ACTIVE",
        type: "boolean",
        editable: false,
        priority: 3,
      },
      {
        key: "createdAt",
        header: "Created At",
        minWidth: 100,
        sortable: true,
        sortKey: "CREATED_AT",
        type: "datetime",
        editable: false,
        priority: 4,
      },
      {
        key: "createdBy",
        header: "Created By",
        minWidth: 100,
        sortable: true,
        sortKey: "CREATED_BY",
        type: "string",
        editable: false,
        priority: 5,
      },
      {
        key: "updatedAt",
        header: "Updated At",
        minWidth: 100,
        sortable: true,
        sortKey: "UPDATED_AT",
        type: "datetime",
        editable: false,
        priority: 6,
      },
      {
        key: "updatedBy",
        header: "Updated By",
        minWidth: 100,
        sortable: true,
        sortKey: "UPDATED_BY",
        type: "string",
        editable: false,
        priority: 7,
      },
    ],
    []
  )

  const filters = useMemo(
    () => (
      <View className="gap-4">
        <View className="gap-3 md:flex-row md:flex-wrap">
          <View className="md:min-w-[200px] md:flex-1">
            <RncInput id="name" label="Name" placeholder="Search name..." />
          </View>
          <View className="md:min-w-[200px] md:flex-1">
            <RncInput
              id="description"
              label="Description"
              placeholder="Search description..."
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

  const actions: RncGridActions<SbfSchemaResponseDto> = useMemo(
    () => ({
      edit: {
        route: (row) => `/admin/schema/${row.id}`,
        disabled: () => !canUpdate,
      },
      delete: {
        onPress: async (row) => {
          if (!row.id) return
          await deleteMutation.mutateAsync({ id: row.id })
        },
        confirm: {
          title: "Delete Schema",
          description: (row) =>
            `Are you sure you want to delete schema "${row.name}"? This action cannot be undone.`,
        },
        disabled: () => !canDelete,
      },
    }),
    [deleteMutation, canUpdate, canDelete]
  )

  return (
    <PermissionGuard permission={viewPermissions.schema}>
      <View className="w-full gap-4 self-center p-4 md:p-6 lg:py-8">
        <Text className="font-bold text-2xl text-foreground md:text-3xl">
          Schemas
        </Text>

        <RncGrid<
          SbfSchemaResponseDto,
          SbfSchemaSortOrderField,
          SchemaListFilters
        >
          id="schema-list"
          columns={columns}
          fetchData={fetchData}
          keyExtractor={(row) => row.id ?? ""}
          addEditMode="default"
          initialSort={[
            { field: SbfSchemaSortOrderField.CREATED_AT, direction: "DESC" },
          ]}
          initialPagination={{
            type: "default",
            pageSize: 20,
            pageNumber: 0,
            pageSizeOptions: [20, 50, 100],
          }}
          actions={actions}
          filters={{ render: filters }}
          toolbar={{
            add: {
              route: "/admin/schema/new",
              label: "Add Schema",
              disabled: !canCreate,
            },
            refresh: {},
            reset: {},
          }}
          onNavigate={router.push}
        />
      </View>
    </PermissionGuard>
  )
}
