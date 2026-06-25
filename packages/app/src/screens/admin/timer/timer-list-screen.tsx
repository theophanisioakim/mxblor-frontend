"use client"

import {
  type SbfTimerResponseDto,
  type SbfTimerSearchRequestDto,
  SbfTimerSortOrderField,
  searchSbfTimers,
} from "@workspace/api-client"
import { useRouter } from "@workspace/router"
import {
  RncCheckbox,
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

type TimerListFilters = Omit<SbfTimerSearchRequestDto, "page" | "size" | "sort">

export function TimerListScreen() {
  const router = useRouter()

  const fetchData = useCallback(
    async (
      params: RncGridFetchDataParams<SbfTimerSortOrderField, TimerListFilters>
    ): Promise<RncGridData<SbfTimerResponseDto>> => {
      const payload: SbfTimerSearchRequestDto = {
        page: params.pagination?.pageNumber ?? 0,
        size: params.pagination?.pageSize ?? 20,
        sort: params.sort,
        ...params.filters,
      }
      const apiResponse = await searchSbfTimers(payload, params.signal)
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

  const columns: RncGridColumn<SbfTimerResponseDto, SbfTimerSortOrderField>[] =
    useMemo(
      () => [
        {
          key: "key",
          header: "Key",
          minWidth: 200,
          sortable: true,
          sortKey: "KEY",
          type: "string",
          editable: false,
          priority: 1,
        },
        {
          key: "active",
          header: "Active",
          minWidth: 70,
          sortable: true,
          sortKey: "ACTIVE",
          type: "boolean",
          editable: false,
          priority: 2,
        },
        {
          key: "lastExecution",
          header: "Last Execution",
          minWidth: 140,
          sortable: true,
          sortKey: "LASTEXECUTION",
          type: "datetime",
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
          key: "failedCount",
          header: "Failed Count",
          minWidth: 100,
          sortable: true,
          sortKey: "FAILEDCOUNT",
          type: "number",
          editable: false,
          priority: 5,
        },
        {
          key: "description",
          header: "Description",
          minWidth: 160,
          sortable: true,
          sortKey: "DESCRIPTION",
          type: "string",
          editable: false,
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
        {
          key: "updatedBy",
          header: "Updated By",
          minWidth: 100,
          sortable: true,
          sortKey: "UPDATED_BY",
          type: "string",
          editable: false,
          priority: 10,
        },
      ],
      []
    )

  const filters: RncGridFiltersConfig<SbfTimerResponseDto, TimerListFilters> =
    useMemo(
      () => ({
        render: (
          <View className="gap-4">
            <View className="gap-3 md:flex-row md:flex-wrap">
              <View className="md:min-w-[200px] md:flex-1">
                <RncInput
                  id="description"
                  label="Description"
                  placeholder="Search description..."
                />
              </View>
              <View className="md:min-w-[200px] md:flex-1">
                <RncInput id="cron" label="Cron" placeholder="Search cron..." />
              </View>
            </View>
            <View className="gap-3 md:flex-row md:flex-wrap md:gap-4">
              <RncCheckbox id="active" label="Active" nullable />
            </View>
          </View>
        ),
      }),
      []
    )

  const actions: RncGridActions<SbfTimerResponseDto> = useMemo(
    () => ({
      edit: {
        route: (row) => `/admin/timer/${row.id}`,
      },
    }),
    []
  )

  return (
    <View className="w-full gap-4 self-center p-4 md:p-6 lg:py-8">
      <Text className="font-bold text-2xl text-foreground md:text-3xl">
        Timers
      </Text>

      <RncGrid<SbfTimerResponseDto, SbfTimerSortOrderField, TimerListFilters>
        id="timer-list"
        columns={columns}
        fetchData={fetchData}
        keyExtractor={(row) => row.id ?? ""}
        addEditMode="default"
        initialSort={[{ field: SbfTimerSortOrderField.KEY, direction: "ASC" }]}
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
  )
}
