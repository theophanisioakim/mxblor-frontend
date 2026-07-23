"use client"

import {
  type SbfPermissionResponseDto,
  type SbfPermissionSearchRequestDto,
  SbfPermissionSortOrderField,
  searchSbfPermissions,
  useBulkSbfPermissions,
  useUpdateSbfPermission,
} from "@workspace/api-client"
import { usePermission } from "@workspace/providers"
import {
  RncCheckbox,
  RncGrid,
  type RncGridColumn,
  type RncGridData,
  type RncGridFetchDataParams,
  type RncGridFiltersConfig,
  type RncGridInlineEditConfig,
  RncInput,
  Text,
  View,
} from "@workspace/ui"
import { useCallback, useMemo } from "react"
import { PermissionGuard } from "../../permission-guard"
import {
  inlineEditPermissions,
  viewPermissions,
} from "../../screen-permissions"

type PermissionListFilters = Omit<
  SbfPermissionSearchRequestDto,
  "page" | "size" | "sort"
>

export function PermissionListScreen() {
  const updateMutation = useUpdateSbfPermission()
  const bulkMutation = useBulkSbfPermissions()
  const { hasPermission } = usePermission()
  // Inline editing saves per-row (PUT) and save-all (bulk POST); without both
  // grants the grid renders read-only.
  const canEdit =
    hasPermission(inlineEditPermissions.permission.update) &&
    hasPermission(inlineEditPermissions.permission.bulk)

  const fetchData = useCallback(
    async (
      params: RncGridFetchDataParams<
        SbfPermissionSortOrderField,
        PermissionListFilters
      >
    ): Promise<RncGridData<SbfPermissionResponseDto>> => {
      const payload: SbfPermissionSearchRequestDto = {
        page: params.pagination?.pageNumber ?? 0,
        size: params.pagination?.pageSize ?? 20,
        sort: params.sort,
        ...params.filters,
      }
      const apiResponse = await searchSbfPermissions(payload, params.signal)
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
    SbfPermissionResponseDto,
    SbfPermissionSortOrderField
  >[] = useMemo(
    () => [
      {
        key: "alias",
        header: "Alias",
        minWidth: 160,
        sortable: true,
        sortKey: "ALIAS",
        type: "string",
        editable: true,
        priority: 1,
      },
      {
        key: "description",
        header: "Description",
        minWidth: 200,
        sortable: true,
        sortKey: "DESCRIPTION",
        type: "string",
        editable: true,
        priority: 2,
      },
      {
        key: "endpoint",
        header: "Endpoint",
        minWidth: 200,
        sortable: true,
        sortKey: "ENDPOINT",
        type: "string",
        editable: false,
        priority: 3,
      },
      {
        key: "method",
        header: "Method",
        minWidth: 80,
        sortable: true,
        sortKey: "METHOD",
        type: "string",
        editable: false,
        priority: 4,
      },
      {
        key: "isPublic",
        header: "Public",
        minWidth: 70,
        sortable: true,
        sortKey: "ISPUBLIC",
        type: "boolean",
        editable: false,
        priority: 5,
      },
      {
        key: "otpEnabled",
        header: "OTP Enabled",
        minWidth: 70,
        sortable: true,
        sortKey: "OTPENABLED",
        type: "boolean",
        editable: true,
        nullable: false,
        priority: 6,
      },
      {
        key: "createdAt",
        header: "Created At",
        minWidth: 100,
        sortable: true,
        sortKey: "CREATED_AT",
        type: "datetime",
        editable: false,
        priority: 7,
      },
      {
        key: "updatedAt",
        header: "Updated At",
        minWidth: 100,
        sortable: true,
        sortKey: "UPDATED_AT",
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
    ],
    []
  )

  const inlineEdit: RncGridInlineEditConfig<SbfPermissionResponseDto> = useMemo(
    () => ({
      mode: "all",
      onSave: async (row, updatedValues) => {
        if (!row.id) return false
        await updateMutation.mutateAsync({
          id: row.id,
          data: {
            id: row.id,
            alias: updatedValues.alias ?? row.alias ?? "",
            description: updatedValues.description ?? row.description,
            endpoint: row.endpoint ?? "",
            isPublic: row.isPublic ?? false,
            method: row.method ?? "",
            otpEnabled: updatedValues.otpEnabled ?? row.otpEnabled ?? false,
            version: row.version ?? 0,
          },
        })
        return true
      },
      onSaveAll: async (entries) => {
        const updateRequests = entries.flatMap(({ row, updatedValues }) => {
          if (!row.id) return []
          return [
            {
              id: row.id,
              alias: (updatedValues.alias as string) ?? row.alias ?? "",
              description:
                (updatedValues.description as string) ?? row.description,
              endpoint: row.endpoint ?? "",
              isPublic: row.isPublic ?? false,
              method: row.method ?? "",
              otpEnabled:
                (updatedValues.otpEnabled as boolean) ??
                row.otpEnabled ??
                false,
              version: row.version ?? 0,
            },
          ]
        })
        if (updateRequests.length === 0) return true
        await bulkMutation.mutateAsync({ data: { updateRequests } })
        return true
      },
    }),
    [updateMutation, bulkMutation]
  )

  const filters: RncGridFiltersConfig<
    SbfPermissionResponseDto,
    PermissionListFilters
  > = useMemo(
    () => ({
      render: (
        <View className="gap-4">
          <View className="gap-3 md:flex-row md:flex-wrap">
            <View className="md:min-w-[200px] md:flex-1">
              <RncInput
                id="alias"
                label="Alias"
                placeholder="Search alias..."
              />
            </View>
            <View className="md:min-w-[200px] md:flex-1">
              <RncInput
                id="description"
                label="Description"
                placeholder="Search description..."
              />
            </View>
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
          </View>
          <View className="gap-3 md:flex-row md:flex-wrap md:gap-4">
            <RncCheckbox id="isPublic" label="Public" nullable />
            <RncCheckbox id="otpEnabled" label="OTP Enabled" nullable />
          </View>
        </View>
      ),
    }),
    []
  )

  return (
    <PermissionGuard permission={viewPermissions.permission}>
      <View className="w-full gap-4 self-center p-4 md:p-6 lg:py-8">
        <Text className="font-bold text-2xl text-foreground md:text-3xl">
          Permissions
        </Text>

        <RncGrid<
          SbfPermissionResponseDto,
          SbfPermissionSortOrderField,
          PermissionListFilters
        >
          id="permission-list"
          columns={columns}
          fetchData={fetchData}
          keyExtractor={(row) => row.id ?? ""}
          addEditMode={canEdit ? "inline" : "default"}
          inlineEdit={canEdit ? inlineEdit : undefined}
          initialSort={[
            {
              field: SbfPermissionSortOrderField.CREATED_AT,
              direction: "DESC",
            },
          ]}
          initialPagination={{
            type: "default",
            pageSize: 20,
            pageNumber: 0,
            pageSizeOptions: [20, 50, 100],
          }}
          toolbar={{ refresh: {}, reset: {} }}
          filters={filters}
        />
      </View>
    </PermissionGuard>
  )
}
