"use client"

import {
  type SbfTimerInfoResponseDto,
  type SbfTimerInfoSearchRequestDto,
  SbfTimerInfoSortOrderField,
  searchSbfTimerInfos,
} from "@workspace/api-client"
import {
  RncDateTimeField,
  RncGrid,
  type RncGridColumn,
  type RncGridData,
  type RncGridFetchDataParams,
  type RncGridFiltersConfig,
  RncInput,
  View,
} from "@workspace/ui"
import { useCallback, useMemo } from "react"

type TimerInfoFilters = Omit<
  SbfTimerInfoSearchRequestDto,
  "page" | "size" | "sort"
>

/**
 * Timer execution history grid. Shared by the standalone `/admin/timer-info`
 * route and the timer form's "Executions" tab — pass `timerId` there to scope
 * the rows to a single timer (the column for the timer key is hidden).
 */
export function TimerInfoListGrid({ timerId }: Readonly<{ timerId?: string }>) {
  const fetchData = useCallback(
    async (
      params: RncGridFetchDataParams<
        SbfTimerInfoSortOrderField,
        TimerInfoFilters
      >
    ): Promise<RncGridData<SbfTimerInfoResponseDto>> => {
      const payload: SbfTimerInfoSearchRequestDto = {
        page: params.pagination?.pageNumber ?? 0,
        size: params.pagination?.pageSize ?? 20,
        sort: params.sort,
        ...params.filters,
      }
      const apiResponse = await searchSbfTimerInfos(payload, params.signal)
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
    SbfTimerInfoResponseDto,
    SbfTimerInfoSortOrderField
  >[] = useMemo(
    () => [
      ...(timerId == null
        ? ([
            {
              key: "timerKey",
              header: "Timer Key",
              minWidth: 150,
              sortable: true,
              sortKey: "TIMER_KEY",
              type: "string",
              editable: false,
              priority: 1,
            },
          ] as RncGridColumn<
            SbfTimerInfoResponseDto,
            SbfTimerInfoSortOrderField
          >[])
        : []),
      {
        key: "executedOn",
        header: "Executed On",
        minWidth: 160,
        sortable: true,
        sortKey: "EXECUTEDON",
        type: "datetime",
        editable: false,
        priority: 2,
      },
      {
        key: "instanceId",
        header: "Instance ID",
        minWidth: 150,
        sortable: true,
        sortKey: "INSTANCEID",
        type: "string",
        editable: false,
        priority: 3,
      },
      {
        key: "cron",
        header: "Cron",
        minWidth: 120,
        sortable: true,
        sortKey: "CRON",
        type: "string",
        editable: false,
        priority: 4,
      },
      {
        key: "details",
        header: "Details",
        minWidth: 150,
        sortable: true,
        sortKey: "DETAILS",
        type: "string",
        editable: false,
        priority: 5,
      },
    ],
    [timerId]
  )

  const filters: RncGridFiltersConfig<
    SbfTimerInfoResponseDto,
    TimerInfoFilters
  > = useMemo(
    () => ({
      ...(timerId != null && { persistent: { timerId } }),
      render: (
        <View className="gap-4">
          <View className="gap-3 md:flex-row md:flex-wrap">
            <View className="md:min-w-[200px] md:flex-1">
              <RncInput
                id="details"
                label="Details"
                placeholder="Search details..."
              />
            </View>
            <View className="md:min-w-[200px] md:flex-1">
              <RncInput id="cron" label="Cron" placeholder="Search cron..." />
            </View>
          </View>
          <View className="gap-3 md:flex-row md:flex-wrap">
            <View className="md:min-w-[200px] md:flex-1">
              <RncDateTimeField
                id="executedOnFrom"
                label="Executed From"
                type="datetime"
              />
            </View>
            <View className="md:min-w-[200px] md:flex-1">
              <RncDateTimeField
                id="executedOnTo"
                label="Executed To"
                type="datetime"
              />
            </View>
          </View>
        </View>
      ),
    }),
    [timerId]
  )

  return (
    <RncGrid<
      SbfTimerInfoResponseDto,
      SbfTimerInfoSortOrderField,
      TimerInfoFilters
    >
      id={timerId == null ? "timer-info-list" : `timer-info-${timerId}`}
      columns={columns}
      fetchData={fetchData}
      keyExtractor={(row) => row.id ?? ""}
      addEditMode="default"
      initialSort={[
        { field: SbfTimerInfoSortOrderField.EXECUTEDON, direction: "DESC" },
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
