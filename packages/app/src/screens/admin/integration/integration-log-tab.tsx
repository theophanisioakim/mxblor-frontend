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
  View,
} from "@workspace/ui"
import { useCallback, useMemo } from "react"

type LogIntegrationFilters = Omit<
  SbfLogIntegrationSearchRequestDto,
  "page" | "size" | "sort" | "className" | "methodName"
>

export function IntegrationLogTab({
  className,
  methodName,
}: Readonly<{ className: string; methodName: string }>) {
  const fetchData = useCallback(
    async (
      params: RncGridFetchDataParams<
        SbfLogIntegrationSortOrderField,
        LogIntegrationFilters
      >
    ): Promise<RncGridData<SbfLogIntegrationResponseDto>> => {
      const payload: SbfLogIntegrationSearchRequestDto = {
        page: params.pagination?.pageNumber ?? 0,
        size: params.pagination?.pageSize ?? 20,
        sort: params.sort,
        className,
        methodName,
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
    [className, methodName]
  )

  const columns: RncGridColumn<
    SbfLogIntegrationResponseDto,
    SbfLogIntegrationSortOrderField
  >[] = useMemo(
    () => [
      {
        key: "statusCode",
        header: "Status Code",
        minWidth: 80,
        sortable: true,
        sortKey: "STATUSCODE",
        type: "number",
        editable: false,
        priority: 1,
      },
      {
        key: "duration",
        header: "Duration (ms)",
        minWidth: 80,
        sortable: true,
        sortKey: "DURATION",
        type: "number",
        editable: false,
        priority: 2,
      },
      {
        key: "requestSucceeded",
        header: "Succeeded",
        minWidth: 70,
        sortable: true,
        sortKey: "REQUESTSUCCEEDED",
        type: "boolean",
        editable: false,
        priority: 3,
      },
      {
        key: "requestTimestamp",
        header: "Request Time",
        minWidth: 120,
        sortable: true,
        sortKey: "REQUESTTIMESTAMP",
        type: "datetime",
        editable: false,
        priority: 4,
      },
      {
        key: "errorMessage",
        header: "Error Message",
        minWidth: 150,
        sortable: true,
        sortKey: "ERRORMESSAGE",
        type: "string",
        editable: false,
        priority: 5,
      },
      {
        key: "baseUrl",
        header: "Base URL",
        minWidth: 130,
        sortable: true,
        sortKey: "BASEURL",
        type: "string",
        editable: false,
        priority: 6,
      },
      {
        key: "endpoint",
        header: "Endpoint",
        minWidth: 120,
        sortable: true,
        sortKey: "ENDPOINT",
        type: "string",
        editable: false,
        priority: 7,
      },
      {
        key: "method",
        header: "Method",
        minWidth: 70,
        sortable: true,
        sortKey: "METHOD",
        type: "string",
        editable: false,
        priority: 8,
      },
    ],
    []
  )

  const filters: RncGridFiltersConfig<
    SbfLogIntegrationResponseDto,
    LogIntegrationFilters
  > = useMemo(
    () => ({
      render: (
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
          <View className="md:min-w-[150px] md:flex-1">
            <RncInput
              id="statusCode"
              label="Status Code"
              placeholder="e.g. 200"
              keyboardType="numeric"
            />
          </View>
          <View className="md:min-w-[150px] md:flex-1">
            <RncCheckbox id="requestSucceeded" label="Succeeded" nullable />
          </View>
        </View>
      ),
    }),
    []
  )

  return (
    <RncGrid<
      SbfLogIntegrationResponseDto,
      SbfLogIntegrationSortOrderField,
      LogIntegrationFilters
    >
      id={`integration-log-tab-${className}-${methodName}`}
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
  )
}
