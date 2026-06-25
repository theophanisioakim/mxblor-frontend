"use client"

import {
  type SbfOtpResponseDto,
  type SbfOtpSearchRequestDto,
  SbfOtpSortOrderField,
  searchSbfOtps,
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

type OtpListFilters = Omit<SbfOtpSearchRequestDto, "page" | "size" | "sort">

export function OtpListScreen() {
  const fetchData = useCallback(
    async (
      params: RncGridFetchDataParams<SbfOtpSortOrderField, OtpListFilters>
    ): Promise<RncGridData<SbfOtpResponseDto>> => {
      const payload: SbfOtpSearchRequestDto = {
        page: params.pagination?.pageNumber ?? 0,
        size: params.pagination?.pageSize ?? 20,
        sort: params.sort,
        ...params.filters,
      }
      const apiResponse = await searchSbfOtps(payload, params.signal)
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

  const columns: RncGridColumn<SbfOtpResponseDto, SbfOtpSortOrderField>[] =
    useMemo(
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
          // Not sortable: backend SbfOtpSortOrderField has no USERID field.
          key: "userId",
          header: "User ID",
          minWidth: 160,
          type: "string",
          editable: false,
          priority: 2,
        },
        {
          key: "value",
          header: "Value",
          minWidth: 120,
          sortable: true,
          sortKey: "VALUE",
          type: "string",
          editable: false,
          priority: 3,
        },
        {
          key: "requestHash",
          header: "Request Hash",
          minWidth: 200,
          sortable: true,
          sortKey: "REQUESTHASH",
          type: "string",
          editable: false,
          priority: 4,
        },
        {
          key: "failedAttempts",
          header: "Failed Attempts",
          minWidth: 100,
          sortable: true,
          sortKey: "FAILEDATTEMPTS",
          type: "number",
          editable: false,
          priority: 5,
        },
        {
          key: "expired",
          header: "Expired",
          minWidth: 80,
          sortable: true,
          sortKey: "EXPIRED",
          type: "boolean",
          editable: false,
          priority: 6,
        },
        {
          key: "updatedAt",
          header: "Updated At",
          minWidth: 140,
          sortable: true,
          sortKey: "UPDATED_AT",
          type: "datetime",
          editable: false,
          priority: 7,
        },
      ],
      []
    )

  const filters: RncGridFiltersConfig<SbfOtpResponseDto, OtpListFilters> =
    useMemo(
      () => ({
        render: (
          <View className="gap-4">
            <View className="gap-3 md:flex-row md:flex-wrap">
              <View className="md:min-w-[200px] md:flex-1">
                <RncInput
                  id="userId"
                  label="User ID"
                  placeholder="Search user ID..."
                />
              </View>
              <View className="md:min-w-[200px] md:flex-1">
                <RncInput
                  id="value"
                  label="Value"
                  placeholder="Search value..."
                />
              </View>
              <View className="md:min-w-[200px] md:flex-1">
                <RncInput
                  id="requestHash"
                  label="Request Hash"
                  placeholder="Search request hash..."
                />
              </View>
            </View>
            <View className="gap-3 md:flex-row md:flex-wrap md:gap-4">
              <RncCheckbox id="expired" label="Expired" nullable />
            </View>
          </View>
        ),
      }),
      []
    )

  return (
    <View className="w-full gap-4 self-center p-4 md:p-6 lg:py-8">
      <Text className="font-bold text-2xl text-foreground md:text-3xl">
        OTP
      </Text>

      <RncGrid<SbfOtpResponseDto, SbfOtpSortOrderField, OtpListFilters>
        id="otp-list"
        columns={columns}
        fetchData={fetchData}
        keyExtractor={(row) => row.id ?? ""}
        addEditMode="default"
        initialSort={[
          { field: SbfOtpSortOrderField.CREATED_AT, direction: "DESC" },
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
