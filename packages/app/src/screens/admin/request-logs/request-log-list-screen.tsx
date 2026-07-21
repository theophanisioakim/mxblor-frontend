"use client"

import {
  type SbfLogRequestResponseDto,
  type SbfLogRequestSearchRequestDto,
  SbfLogRequestSortOrderField,
  searchSbfLogRequests,
} from "@workspace/api-client"
import { useRouter } from "@workspace/router"
import {
  RncCheckbox,
  RncDateTimeField,
  RncGrid,
  type RncGridActions,
  type RncGridColumn,
  type RncGridData,
  type RncGridFetchDataParams,
  type RncGridFiltersConfig,
  RncInput,
  Text,
  View,
} from "@workspace/ui"
import { useCallback, useMemo } from "react"
import { PermissionGuard } from "../../permission-guard"
import { viewPermissions } from "../../screen-permissions"

type RequestLogListFilters = Omit<
  SbfLogRequestSearchRequestDto,
  "page" | "size" | "sort"
>

export function RequestLogListScreen() {
  const router = useRouter()

  const fetchData = useCallback(
    async (
      params: RncGridFetchDataParams<
        SbfLogRequestSortOrderField,
        RequestLogListFilters
      >
    ): Promise<RncGridData<SbfLogRequestResponseDto>> => {
      const payload: SbfLogRequestSearchRequestDto = {
        page: params.pagination?.pageNumber ?? 0,
        size: params.pagination?.pageSize ?? 20,
        sort: params.sort,
        ...params.filters,
      }
      const apiResponse = await searchSbfLogRequests(payload, params.signal)
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
    SbfLogRequestResponseDto,
    SbfLogRequestSortOrderField
  >[] = useMemo(
    () => [
      {
        key: "requestTimestamp",
        header: "Timestamp",
        minWidth: 140,
        sortable: true,
        sortKey: "REQUESTTIMESTAMP",
        type: "datetime",
        editable: false,
        priority: 1,
      },
      {
        key: "method",
        header: "Method",
        minWidth: 80,
        sortable: true,
        sortKey: "METHOD",
        type: "string",
        editable: false,
        priority: 2,
      },
      {
        key: "statusCode",
        header: "Status",
        minWidth: 70,
        sortable: true,
        sortKey: "STATUSCODE",
        type: "number",
        editable: false,
        priority: 3,
      },
      {
        key: "url",
        header: "URL",
        minWidth: 200,
        sortable: true,
        sortKey: "URL",
        type: "string",
        editable: false,
        priority: 4,
      },
      {
        key: "ip",
        header: "IP",
        minWidth: 120,
        sortable: true,
        sortKey: "IP",
        type: "string",
        editable: false,
        priority: 5,
      },
      {
        key: "hostname",
        header: "Hostname",
        minWidth: 120,
        sortable: true,
        sortKey: "HOSTNAME",
        type: "string",
        editable: false,
        priority: 6,
      },
      {
        key: "duration",
        header: "Duration (ms)",
        minWidth: 100,
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
        key: "isTokenSupplied",
        header: "Token",
        minWidth: 70,
        sortable: true,
        sortKey: "ISTOKENSUPPLIED",
        type: "boolean",
        editable: false,
        priority: 9,
      },
      {
        key: "isUrlPublic",
        header: "Public",
        minWidth: 70,
        sortable: true,
        sortKey: "ISURLPUBLIC",
        type: "boolean",
        editable: false,
        priority: 10,
      },
      {
        key: "isUserAuthenticated",
        header: "Authenticated",
        minWidth: 70,
        sortable: true,
        sortKey: "ISUSERAUTHENTICATED",
        type: "boolean",
        editable: false,
        priority: 11,
      },
    ],
    []
  )

  const filters: RncGridFiltersConfig<
    SbfLogRequestResponseDto,
    RequestLogListFilters
  > = useMemo(
    () => ({
      render: (
        <View className="gap-4">
          <View className="gap-3 md:flex-row md:flex-wrap">
            <View className="md:min-w-[200px] md:flex-1">
              <RncInput id="url" label="URL" placeholder="Search URL..." />
            </View>
            <View className="md:min-w-[200px] md:flex-1">
              <RncInput id="ip" label="IP" placeholder="Search IP..." />
            </View>
            <View className="md:min-w-[200px] md:flex-1">
              <RncInput
                id="hostname"
                label="Hostname"
                placeholder="Search hostname..."
              />
            </View>
            <View className="md:min-w-[200px] md:flex-1">
              <RncInput
                id="traceId"
                label="Trace ID"
                placeholder="Search trace ID..."
              />
            </View>
          </View>
          <View className="gap-3 md:flex-row md:flex-wrap md:gap-4">
            <RncCheckbox id="requestSucceeded" label="Succeeded" nullable />
            <RncCheckbox id="isTokenSupplied" label="Token Supplied" nullable />
            <RncCheckbox id="isUrlPublic" label="Public URL" nullable />
            <RncCheckbox
              id="isUserAuthenticated"
              label="Authenticated"
              nullable
            />
          </View>
          <View className="gap-3 md:flex-row md:flex-wrap">
            <View className="md:min-w-[200px] md:flex-1">
              <RncDateTimeField
                id="requestTimestampFrom"
                label="Timestamp From"
                type="datetime"
              />
            </View>
            <View className="md:min-w-[200px] md:flex-1">
              <RncDateTimeField
                id="requestTimestampTo"
                label="Timestamp To"
                type="datetime"
              />
            </View>
          </View>
        </View>
      ),
    }),
    []
  )

  const actions: RncGridActions<SbfLogRequestResponseDto> = useMemo(
    () => ({
      edit: {
        route: (row) => `/admin/request-logs/${row.id}`,
      },
    }),
    []
  )

  return (
    <PermissionGuard permission={viewPermissions.requestLog}>
      <View className="w-full gap-4 self-center p-4 md:p-6 lg:py-8">
        <Text className="font-bold text-2xl text-foreground md:text-3xl">
          Request Logs
        </Text>

        <RncGrid<
          SbfLogRequestResponseDto,
          SbfLogRequestSortOrderField,
          RequestLogListFilters
        >
          id="request-log-list"
          columns={columns}
          fetchData={fetchData}
          keyExtractor={(row) => row.id ?? ""}
          addEditMode="default"
          initialSort={[
            {
              field: SbfLogRequestSortOrderField.REQUESTTIMESTAMP,
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
          filters={filters}
          toolbar={{ refresh: {}, reset: {} }}
          onNavigate={router.push}
        />
      </View>
    </PermissionGuard>
  )
}
