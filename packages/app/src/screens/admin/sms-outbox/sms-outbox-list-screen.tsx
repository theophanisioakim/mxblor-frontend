"use client"

import {
  type SbfSmsOutboxResponseDto,
  type SbfSmsOutboxSearchRequestDto,
  SbfSmsOutboxSortOrderField,
  searchSbfSmsOutboxs,
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

type SmsOutboxListFilters = Omit<
  SbfSmsOutboxSearchRequestDto,
  "page" | "size" | "sort"
>

export function SmsOutboxListScreen() {
  const fetchData = useCallback(
    async (
      params: RncGridFetchDataParams<
        SbfSmsOutboxSortOrderField,
        SmsOutboxListFilters
      >
    ): Promise<RncGridData<SbfSmsOutboxResponseDto>> => {
      const payload: SbfSmsOutboxSearchRequestDto = {
        page: params.pagination?.pageNumber ?? 0,
        size: params.pagination?.pageSize ?? 20,
        sort: params.sort,
        ...params.filters,
      }
      const apiResponse = await searchSbfSmsOutboxs(payload, params.signal)
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
    SbfSmsOutboxResponseDto,
    SbfSmsOutboxSortOrderField
  >[] = useMemo(
    () => [
      {
        key: "createdAt",
        header: "Created At",
        minWidth: 140,
        sortable: true,
        sortKey: "CREATED_AT",
        type: "datetime",
        editable: false,
        priority: 1,
      },
      {
        key: "recipient",
        header: "Recipient",
        minWidth: 160,
        sortable: true,
        sortKey: "RECIPIENT",
        type: "string",
        editable: false,
        priority: 2,
      },
      {
        key: "messageContent",
        header: "Message",
        minWidth: 240,
        sortable: true,
        sortKey: "MESSAGECONTENT",
        type: "string",
        editable: false,
        priority: 3,
      },
      {
        key: "scheduledAt",
        header: "Scheduled At",
        minWidth: 140,
        sortable: true,
        sortKey: "SCHEDULEDAT",
        type: "datetime",
        editable: false,
        priority: 4,
      },
      {
        key: "sentAt",
        header: "Sent At",
        minWidth: 140,
        sortable: true,
        sortKey: "SENTAT",
        type: "datetime",
        editable: false,
        priority: 5,
      },
      {
        key: "retryCount",
        header: "Retries",
        minWidth: 80,
        sortable: true,
        sortKey: "RETRYCOUNT",
        type: "number",
        editable: false,
        priority: 6,
      },
      {
        key: "errorMessage",
        header: "Error",
        minWidth: 200,
        sortable: true,
        sortKey: "ERRORMESSAGE",
        type: "string",
        editable: false,
        priority: 7,
      },
      {
        key: "traceId",
        header: "Trace ID",
        minWidth: 160,
        sortable: true,
        sortKey: "TRACEID",
        type: "string",
        editable: false,
        priority: 8,
      },
    ],
    []
  )

  const filters: RncGridFiltersConfig<
    SbfSmsOutboxResponseDto,
    SmsOutboxListFilters
  > = useMemo(
    () => ({
      render: (
        <View className="gap-4">
          <View className="gap-3 md:flex-row md:flex-wrap">
            <View className="md:min-w-[200px] md:flex-1">
              <RncInput
                id="recipient"
                label="Recipient"
                placeholder="Search recipient..."
              />
            </View>
            <View className="md:min-w-[200px] md:flex-1">
              <RncInput
                id="messageContent"
                label="Message"
                placeholder="Search message..."
              />
            </View>
            <View className="md:min-w-[200px] md:flex-1">
              <RncInput
                id="errorMessage"
                label="Error Message"
                placeholder="Search error..."
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
          <View className="gap-3 md:flex-row md:flex-wrap">
            <View className="md:min-w-[200px] md:flex-1">
              <RncDateTimeField
                id="scheduledAtFrom"
                label="Scheduled From"
                type="datetime"
              />
            </View>
            <View className="md:min-w-[200px] md:flex-1">
              <RncDateTimeField
                id="scheduledAtTo"
                label="Scheduled To"
                type="datetime"
              />
            </View>
            <View className="md:min-w-[200px] md:flex-1">
              <RncDateTimeField
                id="sentAtFrom"
                label="Sent From"
                type="datetime"
              />
            </View>
            <View className="md:min-w-[200px] md:flex-1">
              <RncDateTimeField id="sentAtTo" label="Sent To" type="datetime" />
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
        SMS Outbox
      </Text>

      <RncGrid<
        SbfSmsOutboxResponseDto,
        SbfSmsOutboxSortOrderField,
        SmsOutboxListFilters
      >
        id="sms-outbox-list"
        columns={columns}
        fetchData={fetchData}
        keyExtractor={(row) => row.id ?? ""}
        addEditMode="default"
        initialSort={[
          { field: SbfSmsOutboxSortOrderField.CREATED_AT, direction: "DESC" },
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
