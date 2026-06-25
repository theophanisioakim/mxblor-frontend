"use client"

import {
  type SbfSchemaPropertiesResponseDto,
  type SbfSchemaPropertiesSearchRequestDto,
  SbfSchemaPropertiesSortOrderField,
  searchSbfSchemaPropertiess,
  useBulkSbfSchemaPropertiess,
  useUpdateSbfSchemaProperties,
} from "@workspace/api-client"
import {
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

type SchemaPropertiesListFilters = Omit<
  SbfSchemaPropertiesSearchRequestDto,
  "page" | "size" | "sort"
>

export function SchemaPropertiesListScreen() {
  const updateMutation = useUpdateSbfSchemaProperties()
  const bulkMutation = useBulkSbfSchemaPropertiess()

  const fetchData = useCallback(
    async (
      params: RncGridFetchDataParams<
        SbfSchemaPropertiesSortOrderField,
        SchemaPropertiesListFilters
      >
    ): Promise<RncGridData<SbfSchemaPropertiesResponseDto>> => {
      const payload: SbfSchemaPropertiesSearchRequestDto = {
        page: params.pagination?.pageNumber ?? 0,
        size: params.pagination?.pageSize ?? 20,
        sort: params.sort,
        ...params.filters,
      }
      const apiResponse = await searchSbfSchemaPropertiess(
        payload,
        params.signal
      )
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
    SbfSchemaPropertiesResponseDto,
    SbfSchemaPropertiesSortOrderField
  >[] = useMemo(
    () => [
      {
        key: "key",
        header: "Key",
        minWidth: 160,
        sortable: true,
        sortKey: "KEY",
        type: "string",
        editable: false,
        priority: 1,
      },
      {
        key: "type",
        header: "Type",
        minWidth: 100,
        sortable: true,
        sortKey: "TYPE",
        type: "string",
        editable: false,
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
        key: "createdBy",
        header: "Created By",
        minWidth: 100,
        sortable: true,
        sortKey: "CREATED_BY",
        type: "string",
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
              type: row.type ?? "",
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
                type: row.type ?? "",
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
    SchemaPropertiesListFilters
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
    <View className="w-full gap-4 self-center p-4 md:p-6 lg:py-8">
      <Text className="font-bold text-2xl text-foreground md:text-3xl">
        Schema Properties
      </Text>

      <RncGrid<
        SbfSchemaPropertiesResponseDto,
        SbfSchemaPropertiesSortOrderField,
        SchemaPropertiesListFilters
      >
        id="schema-properties-list"
        columns={columns}
        fetchData={fetchData}
        keyExtractor={(row) => row.id ?? ""}
        addEditMode="inline"
        inlineEdit={inlineEdit}
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
    </View>
  )
}
