"use client"

import {
  type SbfLogServerResponseDto,
  type SbfLogServerSearchRequestDto,
  SbfLogServerSortOrderField,
  searchSbfLogServers,
} from "@workspace/api-client"
import {
  RncDateTimeField,
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
import { PermissionGuard } from "../../permission-guard"
import { viewPermissions } from "../../screen-permissions"

type ServerLogListFilters = Omit<
  SbfLogServerSearchRequestDto,
  "page" | "size" | "sort"
>

export function ServerLogListScreen() {
  const fetchData = useCallback(
    async (
      params: RncGridFetchDataParams<
        SbfLogServerSortOrderField,
        ServerLogListFilters
      >
    ): Promise<RncGridData<SbfLogServerResponseDto>> => {
      const payload: SbfLogServerSearchRequestDto = {
        page: params.pagination?.pageNumber ?? 0,
        size: params.pagination?.pageSize ?? 20,
        sort: params.sort,
        ...params.filters,
      }
      const apiResponse = await searchSbfLogServers(payload, params.signal)
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
    SbfLogServerResponseDto,
    SbfLogServerSortOrderField
  >[] = useMemo(
    () => [
      {
        key: "timestamp",
        header: "Timestamp",
        minWidth: 140,
        sortable: true,
        sortKey: "TIMESTAMP",
        type: "datetime",
        editable: false,
        priority: 1,
      },
      {
        key: "level",
        header: "Level",
        minWidth: 80,
        sortable: true,
        sortKey: "LEVEL",
        type: "string",
        editable: false,
        priority: 2,
      },
      {
        key: "logger",
        header: "Logger",
        minWidth: 160,
        sortable: true,
        sortKey: "LOGGER",
        type: "string",
        editable: false,
        priority: 3,
      },
      {
        key: "instanceId",
        header: "Instance ID",
        minWidth: 120,
        sortable: true,
        sortKey: "INSTANCEID",
        type: "string",
        editable: false,
        priority: 4,
      },
      {
        key: "message",
        header: "Message",
        minWidth: 600,
        sortable: true,
        sortKey: "MESSAGE",
        type: "string",
        editable: false,
        priority: 5,
      },
      {
        key: "exception",
        header: "Exception",
        minWidth: 1000,
        sortable: true,
        sortKey: "EXCEPTION",
        type: "string",
        editable: false,
        priority: 6,
      },
    ],
    []
  )

  const filters: RncGridFiltersConfig<
    SbfLogServerResponseDto,
    ServerLogListFilters
  > = useMemo(
    () => ({
      render: (
        <View className="gap-4">
          <View className="gap-3 md:flex-row md:flex-wrap">
            <View className="md:min-w-[200px] md:flex-1">
              <RncInput
                id="level"
                label="Level"
                placeholder="Search level..."
              />
            </View>
            <View className="md:min-w-[200px] md:flex-1">
              <RncInput
                id="logger"
                label="Logger"
                placeholder="Search logger..."
              />
            </View>
            <View className="md:min-w-[200px] md:flex-1">
              <RncInput
                id="instanceId"
                label="Instance ID"
                placeholder="Search instance..."
              />
            </View>
          </View>
          <View className="gap-3 md:flex-row md:flex-wrap">
            <View className="md:min-w-[200px] md:flex-1">
              <RncInput
                id="message"
                label="Message"
                placeholder="Search message..."
              />
            </View>
            <View className="md:min-w-[200px] md:flex-1">
              <RncInput
                id="exception"
                label="Exception"
                placeholder="Search exception..."
              />
            </View>
          </View>
          <View className="gap-3 md:flex-row md:flex-wrap">
            <View className="md:min-w-[200px] md:flex-1">
              <RncDateTimeField
                id="timestampFrom"
                label="Timestamp From"
                type="datetime"
              />
            </View>
            <View className="md:min-w-[200px] md:flex-1">
              <RncDateTimeField
                id="timestampTo"
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

  return (
    <PermissionGuard permission={viewPermissions.serverLog}>
      <View className="w-full gap-4 self-center p-4 md:p-6 lg:py-8">
        <Text className="font-bold text-2xl text-foreground md:text-3xl">
          Server Logs
        </Text>

        <RncGrid<
          SbfLogServerResponseDto,
          SbfLogServerSortOrderField,
          ServerLogListFilters
        >
          id="server-log-list"
          columns={columns}
          fetchData={fetchData}
          keyExtractor={(row) => row.id ?? ""}
          addEditMode="default"
          initialSort={[
            { field: SbfLogServerSortOrderField.TIMESTAMP, direction: "DESC" },
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
