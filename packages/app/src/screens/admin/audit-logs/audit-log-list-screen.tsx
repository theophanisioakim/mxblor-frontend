"use client"

import {
  type SbfAuditResponseDto,
  type SbfAuditSearchRequestDto,
  SbfAuditSortOrderField,
  searchSbfAudits,
} from "@workspace/api-client"
import {
  RncGrid,
  type RncGridColumn,
  type RncGridData,
  type RncGridFetchDataParams,
  type RncGridFiltersConfig,
  RncInput,
  Text,
  View,
} from "@workspace/ui"
import { useCallback, useMemo } from "react"

type AuditListFilters = Omit<SbfAuditSearchRequestDto, "page" | "size" | "sort">

export function AuditLogListScreen() {
  const fetchData = useCallback(
    async (
      params: RncGridFetchDataParams<SbfAuditSortOrderField, AuditListFilters>
    ): Promise<RncGridData<SbfAuditResponseDto>> => {
      const payload: SbfAuditSearchRequestDto = {
        page: params.pagination?.pageNumber ?? 0,
        size: params.pagination?.pageSize ?? 20,
        sort: params.sort,
        ...params.filters,
      }
      const apiResponse = await searchSbfAudits(payload, params.signal)
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

  const columns: RncGridColumn<SbfAuditResponseDto, SbfAuditSortOrderField>[] =
    useMemo(
      () => [
        {
          key: "event",
          header: "Event",
          minWidth: 100,
          sortable: true,
          sortKey: "EVENT",
          type: "string",
          editable: false,
          priority: 1,
        },
        {
          key: "tableName",
          header: "Table Name",
          minWidth: 140,
          sortable: true,
          sortKey: "TABLENAME",
          type: "string",
          editable: false,
          priority: 2,
        },
        {
          key: "pkValue",
          header: "PK Value",
          minWidth: 120,
          sortable: true,
          sortKey: "PKVALUE",
          type: "string",
          editable: false,
          priority: 3,
        },
        {
          key: "schemaName",
          header: "Schema",
          minWidth: 120,
          sortable: true,
          sortKey: "SCHEMANAME",
          type: "string",
          editable: false,
          priority: 4,
        },
        {
          key: "value",
          header: "Value",
          minWidth: 200,
          sortable: true,
          sortKey: "VALUE",
          type: "string",
          editable: false,
          priority: 5,
        },
        {
          key: "createdAt",
          header: "Created At",
          minWidth: 100,
          sortable: true,
          sortKey: "CREATED_AT",
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
      ],
      []
    )

  const filters: RncGridFiltersConfig<SbfAuditResponseDto, AuditListFilters> =
    useMemo(
      () => ({
        render: (
          <View className="gap-3 md:flex-row md:flex-wrap">
            <View className="md:min-w-[200px] md:flex-1">
              <RncInput
                id="event"
                label="Event"
                placeholder="Search event..."
              />
            </View>
            <View className="md:min-w-[200px] md:flex-1">
              <RncInput
                id="tableName"
                label="Table Name"
                placeholder="Search table name..."
              />
            </View>
            <View className="md:min-w-[200px] md:flex-1">
              <RncInput
                id="schemaName"
                label="Schema"
                placeholder="Search schema..."
              />
            </View>
            <View className="md:min-w-[200px] md:flex-1">
              <RncInput
                id="value"
                label="Value"
                placeholder="Search value..."
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
        Audit Log
      </Text>

      <RncGrid<SbfAuditResponseDto, SbfAuditSortOrderField, AuditListFilters>
        id="audit-log-list"
        columns={columns}
        fetchData={fetchData}
        keyExtractor={(row) => row.id ?? ""}
        addEditMode="default"
        initialSort={[
          { field: SbfAuditSortOrderField.CREATED_AT, direction: "DESC" },
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
