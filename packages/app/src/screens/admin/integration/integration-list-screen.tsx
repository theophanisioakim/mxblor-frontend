"use client"

import {
  type SbfIntegrationResponseDto,
  type SbfIntegrationSearchRequestDto,
  SbfIntegrationSortOrderField,
  searchSbfIntegrations,
  useDeleteSbfIntegration,
} from "@workspace/api-client"
import { useCrudPermissions } from "@workspace/providers"
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
import { PermissionGuard } from "../../permission-guard"
import { crudPermissions, viewPermissions } from "../../screen-permissions"

type IntegrationListFilters = Omit<
  SbfIntegrationSearchRequestDto,
  "page" | "size" | "sort"
>

export function IntegrationListScreen() {
  const router = useRouter()
  const deleteMutation = useDeleteSbfIntegration()
  const { canCreate, canUpdate, canDelete } = useCrudPermissions(
    crudPermissions.integration
  )

  const fetchData = useCallback(
    async (
      params: RncGridFetchDataParams<
        SbfIntegrationSortOrderField,
        IntegrationListFilters
      >
    ): Promise<RncGridData<SbfIntegrationResponseDto>> => {
      const payload: SbfIntegrationSearchRequestDto = {
        page: params.pagination?.pageNumber ?? 0,
        size: params.pagination?.pageSize ?? 20,
        sort: params.sort,
        ...params.filters,
      }
      const apiResponse = await searchSbfIntegrations(payload, params.signal)
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
    SbfIntegrationResponseDto,
    SbfIntegrationSortOrderField
  >[] = useMemo(
    () => [
      {
        key: "className",
        header: "Class Name",
        minWidth: 140,
        sortable: true,
        sortKey: "CLASSNAME",
        type: "string",
        editable: false,
        priority: 1,
      },
      {
        key: "methodName",
        header: "Method Name",
        minWidth: 130,
        sortable: true,
        sortKey: "METHODNAME",
        type: "string",
        editable: false,
        priority: 2,
      },
      {
        key: "baseUrl",
        header: "Base URL",
        minWidth: 150,
        sortable: true,
        sortKey: "BASEURL",
        type: "string",
        editable: false,
        priority: 3,
      },
      {
        key: "endpoint",
        header: "Endpoint",
        minWidth: 130,
        sortable: true,
        sortKey: "ENDPOINT",
        type: "string",
        editable: false,
        priority: 4,
      },
      {
        key: "method",
        header: "Method",
        minWidth: 80,
        sortable: true,
        sortKey: "METHOD",
        type: "string",
        editable: false,
        priority: 5,
      },
      {
        key: "timeoutSecs",
        header: "Timeout (s)",
        minWidth: 80,
        sortable: true,
        sortKey: "TIMEOUTSECS",
        type: "number",
        editable: false,
        priority: 6,
      },
      {
        key: "active",
        header: "Active",
        minWidth: 70,
        sortable: true,
        sortKey: "ACTIVE",
        type: "boolean",
        editable: false,
        priority: 7,
      },
      {
        key: "failedCount",
        header: "Failed Count",
        minWidth: 80,
        sortable: true,
        sortKey: "FAILEDCOUNT",
        type: "number",
        editable: false,
        priority: 8,
      },
      {
        key: "createdAt",
        header: "Created At",
        minWidth: 100,
        sortable: true,
        sortKey: "CREATED_AT",
        type: "datetime",
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
    ],
    []
  )

  const filters = useMemo(
    () => (
      <View className="gap-4">
        <View className="gap-3 md:flex-row md:flex-wrap">
          <View className="md:min-w-[200px] md:flex-1">
            <RncInput
              id="className"
              label="Class Name"
              placeholder="Search class name..."
            />
          </View>
          <View className="md:min-w-[200px] md:flex-1">
            <RncInput
              id="methodName"
              label="Method Name"
              placeholder="Search method name..."
            />
          </View>
          <View className="md:min-w-[200px] md:flex-1">
            <RncInput
              id="baseUrl"
              label="Base URL"
              placeholder="Search base URL..."
            />
          </View>
        </View>
        <View className="gap-3 md:flex-row md:flex-wrap md:items-end">
          <View className="md:min-w-[200px] md:flex-1">
            <RncInput
              id="endpoint"
              label="Endpoint"
              placeholder="Search endpoint..."
            />
          </View>
          <View className="md:min-w-[200px] md:flex-1">
            <RncInput
              id="method"
              label="Method"
              placeholder="Search method..."
            />
          </View>
          <View className="md:min-w-[200px] md:flex-1">
            <RncCheckbox id="active" label="Active" nullable />
          </View>
        </View>
      </View>
    ),
    []
  )

  const selection: RncGridSelectionConfig<SbfIntegrationResponseDto> = useMemo(
    () => ({
      persist: true,
      rowClickable: true,
      bulkActions: [
        {
          key: "delete-selected",
          icon: <Icon as={Trash2} size={16} />,
          label: "Delete selected",
          disabled: !canDelete,
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
    [deleteMutation, canDelete]
  )

  const actions: RncGridActions<SbfIntegrationResponseDto> = useMemo(
    () => ({
      edit: {
        route: (row) => `/admin/integration/${row.id}`,
        disabled: () => !canUpdate,
      },
      delete: {
        onPress: async (row) => {
          if (!row.id) return
          await deleteMutation.mutateAsync({ id: row.id })
        },
        confirm: {
          title: "Delete Integration",
          description: (row) =>
            `Are you sure you want to delete integration "${row.className}.${row.methodName}"? This action cannot be undone.`,
        },
        disabled: () => !canDelete,
      },
    }),
    [deleteMutation, canUpdate, canDelete]
  )

  return (
    <PermissionGuard permission={viewPermissions.integration}>
      <View className="w-full gap-4 self-center p-4 md:p-6 lg:py-8">
        <Text className="font-bold text-2xl text-foreground md:text-3xl">
          Integrations
        </Text>

        <RncGrid<
          SbfIntegrationResponseDto,
          SbfIntegrationSortOrderField,
          IntegrationListFilters
        >
          id="integration-list"
          columns={columns}
          fetchData={fetchData}
          keyExtractor={(row) => row.id ?? ""}
          addEditMode="default"
          initialSort={[
            {
              field: SbfIntegrationSortOrderField.CREATED_AT,
              direction: "DESC",
            },
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
            add: {
              route: "/admin/integration/new",
              label: "Add Integration",
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
