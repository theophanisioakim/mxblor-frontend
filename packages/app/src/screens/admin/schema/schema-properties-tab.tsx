"use client"

import {
  type SbfSchemaPropertiesResponseDto,
  type SbfSchemaPropertiesSearchRequestDto,
  SbfSchemaPropertiesSortOrderField,
  searchSbfSchemaPropertiess,
  useBulkSbfSchemaPropertiess,
  useUpdateSbfSchemaProperties,
} from "@workspace/api-client"
import { usePermission } from "@workspace/providers"
import {
  RncGrid,
  type RncGridColumn,
  type RncGridData,
  type RncGridFetchDataParams,
  type RncGridFiltersConfig,
  type RncGridInlineEditConfig,
  RncInput,
  View,
} from "@workspace/ui"
import { useCallback, useMemo } from "react"
import { inlineEditPermissions } from "../../screen-permissions"

type SchemaPropertiesFilters = Omit<
  SbfSchemaPropertiesSearchRequestDto,
  "page" | "size" | "sort"
>

export function SchemaPropertiesTab() {
  const updateMutation = useUpdateSbfSchemaProperties()
  const bulkMutation = useBulkSbfSchemaPropertiess()
  const { hasPermission } = usePermission()
  // Inline editing saves per-row (PUT) and save-all (bulk POST); without both
  // grants the grid renders read-only.
  const canEdit =
    hasPermission(inlineEditPermissions.schemaProperties.update) &&
    hasPermission(inlineEditPermissions.schemaProperties.bulk)

  const fetchData = useCallback(
    async (
      params: RncGridFetchDataParams<
        SbfSchemaPropertiesSortOrderField,
        SchemaPropertiesFilters
      >
    ): Promise<RncGridData<SbfSchemaPropertiesResponseDto>> => {
      const f = params.filters
      const res = await searchSbfSchemaPropertiess(
        {
          page: params.pagination?.pageNumber ?? 0,
          size: params.pagination?.pageSize ?? 20,
          sort: params.sort,
          key: f?.key || undefined,
          type: f?.type || undefined,
          value: f?.value || undefined,
          description: f?.description || undefined,
        },
        params.signal
      )

      return {
        data: res.content ?? [],
        pagination: {
          isEmpty: res.empty ?? true,
          isFirst: res.first ?? true,
          isLast: res.last ?? true,
          currentPageNumber: res.number ?? 0,
          currentPageElementsSize: res.numberOfElements ?? 0,
          currentPageSize: res.size ?? 0,
          totalElements: res.totalElements ?? 0,
          totalPages: res.totalPages ?? 0,
        },
      }
    },
    []
  )

  const columns: RncGridColumn<
    SbfSchemaPropertiesResponseDto,
    SbfSchemaPropertiesSortOrderField
  >[] = useMemo(
    () => [
      {
        key: "key",
        header: "Key",
        minWidth: 150,
        sortable: true,
        sortKey: "KEY",
        type: "string",
        editable: false,
        priority: 1,
      },
      {
        key: "type",
        header: "Type",
        minWidth: 120,
        sortable: true,
        sortKey: "TYPE",
        type: "string",
        editable: true,
        priority: 2,
      },
      {
        key: "value",
        header: "Value",
        minWidth: 200,
        sortable: true,
        sortKey: "VALUE",
        type: "string",
        editable: true,
        priority: 3,
      },
      {
        key: "description",
        header: "Description",
        minWidth: 200,
        sortable: true,
        sortKey: "DESCRIPTION",
        type: "string",
        editable: false,
        priority: 4,
      },
      {
        key: "createdAt",
        header: "Created At",
        minWidth: 100,
        sortable: true,
        sortKey: "CREATED_AT",
        type: "datetime",
        editable: false,
        priority: 5,
      },
      {
        key: "createdBy",
        header: "Created By",
        minWidth: 100,
        sortable: true,
        sortKey: "CREATED_BY",
        type: "string",
        editable: false,
        priority: 6,
      },
      {
        key: "updatedAt",
        header: "Updated At",
        minWidth: 100,
        sortable: true,
        sortKey: "UPDATED_AT",
        type: "datetime",
        editable: false,
        priority: 7,
      },
      {
        key: "updatedBy",
        header: "Updated By",
        minWidth: 100,
        sortable: true,
        sortKey: "UPDATED_BY",
        type: "string",
        editable: false,
        priority: 8,
      },
    ],
    []
  )

  const inlineEdit: RncGridInlineEditConfig<SbfSchemaPropertiesResponseDto> =
    useMemo(
      () => ({
        mode: "all",
        onSave: async (row, updatedValues) => {
          if (!row.id) return false
          await updateMutation.mutateAsync({
            id: row.id,
            data: {
              id: row.id,
              key: row.key ?? "",
              type: updatedValues.type ?? row.type ?? "",
              value: updatedValues.value ?? row.value ?? "",
              description: row.description,
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
                key: row.key ?? "",
                type: (updatedValues.type as string) ?? row.type ?? "",
                value: (updatedValues.value as string) ?? row.value ?? "",
                description: row.description,
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
    SbfSchemaPropertiesResponseDto,
    SchemaPropertiesFilters
  > = useMemo(
    () => ({
      render: (
        <View className="gap-3 md:flex-row md:flex-wrap">
          <View className="md:min-w-[200px] md:flex-1">
            <RncInput id="key" label="Key" placeholder="Search key..." />
          </View>
          <View className="md:min-w-[200px] md:flex-1">
            <RncInput id="type" label="Type" placeholder="Search type..." />
          </View>
          <View className="md:min-w-[200px] md:flex-1">
            <RncInput id="value" label="Value" placeholder="Search value..." />
          </View>
          <View className="md:min-w-[200px] md:flex-1">
            <RncInput
              id="description"
              label="Description"
              placeholder="Search description..."
            />
          </View>
        </View>
      ),
    }),
    []
  )

  return (
    <RncGrid<
      SbfSchemaPropertiesResponseDto,
      SbfSchemaPropertiesSortOrderField,
      SchemaPropertiesFilters
    >
      id="schema-properties-tab"
      columns={columns}
      fetchData={fetchData}
      keyExtractor={(row) => row.id ?? ""}
      addEditMode={canEdit ? "inline" : "default"}
      inlineEdit={canEdit ? inlineEdit : undefined}
      initialSort={[
        { field: SbfSchemaPropertiesSortOrderField.KEY, direction: "ASC" },
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
  )
}
