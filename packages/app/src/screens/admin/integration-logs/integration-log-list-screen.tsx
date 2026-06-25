"use client"

import {
  type SbfLogIntegrationResponseDto,
  type SbfLogIntegrationSearchRequestDto,
  SbfLogIntegrationSortOrderField,
  searchSbfLogIntegrations,
} from "@workspace/api-client"
import {
  RncCheckbox,
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

type IntegrationLogListFilters = Omit<
  SbfLogIntegrationSearchRequestDto,
  "page" | "size" | "sort"
>

export function IntegrationLogListScreen() {
  const fetchData = useCallback(
    async (
      params: RncGridFetchDataParams<
        SbfLogIntegrationSortOrderField,
        IntegrationLogListFilters
      >
    ): Promise<RncGridData<SbfLogIntegrationResponseDto>> => {
      const payload: SbfLogIntegrationSearchRequestDto = {
        page: params.pagination?.pageNumber ?? 0,
        size: params.pagination?.pageSize ?? 20,
        sort: params.sort,
        ...params.filters,
      }
      const apiResponse = await searchSbfLogIntegrations(payload, params.signal)
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
    SbfLogIntegrationResponseDto,
    SbfLogIntegrationSortOrderField
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
        minWidth: 70,
        sortable: true,
        sortKey: "METHOD",
        type: "string",
        editable: false,
        priority: 5,
      },
      {
        key: "statusCode",
        header: "Status Code",
        minWidth: 80,
        sortable: true,
        sortKey: "STATUSCODE",
        type: "number",
        editable: false,
        priority: 6,
      },
      {
        key: "duration",
        header: "Duration (ms)",
        minWidth: 80,
        sortable: true,
        sortKey: "DURATION",
        type: "number",
        editable: false,
        priority: 7,
      },
      {
        key: "requestSucceeded",
        header: "Succeeded",
        minWidth: 70,
        sortable: true,
        sortKey: "REQUESTSUCCEEDED",
        type: "boolean",
        editable: false,
        priority: 8,
      },
      {
        key: "requestTimestamp",
        header: "Request Time",
        minWidth: 120,
        sortable: true,
        sortKey: "REQUESTTIMESTAMP",
        type: "datetime",
        editable: false,
        priority: 9,
      },
      {
        key: "errorMessage",
        header: "Error Message",
        minWidth: 150,
        sortable: true,
        sortKey: "ERRORMESSAGE",
        type: "string",
        editable: false,
        priority: 10,
      },
      {
        key: "traceId",
        header: "Trace ID",
        minWidth: 120,
        sortable: true,
        sortKey: "TRACEID",
        type: "string",
        editable: false,
        priority: 11,
      },
      {
        key: "createdAt",
        header: "Created At",
        minWidth: 100,
        sortable: true,
        sortKey: "CREATED_AT",
        type: "datetime",
        editable: false,
        priority: 12,
      },
    ],
    []
  )

  const filters: RncGridFiltersConfig<
    SbfLogIntegrationResponseDto,
    IntegrationLogListFilters
  > = useMemo(
    () => ({
      render: (
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
          <View className="gap-3 md:flex-row md:flex-wrap">
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
            <View className="md:min-w-[150px] md:flex-1">
              <RncInput
                id="statusCode"
                label="Status Code"
                placeholder="e.g. 200"
                keyboardType="numeric"
              />
            </View>
          </View>
          <View className="gap-3 md:flex-row md:flex-wrap md:items-end">
            <View className="md:min-w-[200px] md:flex-1">
              <RncInput
                id="traceId"
                label="Trace ID"
                placeholder="Search trace ID..."
              />
            </View>
            <View className="md:min-w-[200px] md:flex-1">
              <RncInput
                id="errorMessage"
                label="Error Message"
                placeholder="Search error message..."
              />
            </View>
            <View className="md:min-w-[150px] md:flex-1">
              <RncCheckbox id="requestSucceeded" label="Succeeded" nullable />
            </View>
          </View>
        </View>
      ),
    }),
    []
  )

  return (
    <View className="w-full gap-4 self-center p-4 md:p-6 lg:py-8">
      <Text className="font-bold text-2xl text-foreground md:text-3xl">
        Integration Logs
      </Text>

      <RncGrid<
        SbfLogIntegrationResponseDto,
        SbfLogIntegrationSortOrderField,
        IntegrationLogListFilters
      >
        id="integration-log-list"
        columns={columns}
        fetchData={fetchData}
        keyExtractor={(row) => row.id ?? ""}
        addEditMode="default"
        initialSort={[
          {
            field: SbfLogIntegrationSortOrderField.REQUESTTIMESTAMP,
            direction: "DESC",
          },
        ]}
        initialPagination={{
          type: "default",
          pageSize: 20,
          pageNumber: 0,
          pageSizeOptions: [20, 50, 100],
        }}
        filters={filters}
        toolbar={{ refresh: {}, reset: {} }}
      />
    </View>
  )
}
