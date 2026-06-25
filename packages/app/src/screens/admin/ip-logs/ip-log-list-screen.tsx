"use client"

import {
  type SbfLogIpResponseDto,
  type SbfLogIpSearchRequestDto,
  SbfLogIpSortOrderField,
  searchSbfLogIps,
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

type IpLogListFilters = Omit<SbfLogIpSearchRequestDto, "page" | "size" | "sort">

/**
 * IP geolocation log. Backs both the `/admin/ip-logs` and `/admin/log-ip`
 * routes (the legacy repo had two screens over the same `SbfLogIp` entity).
 */
export function IpLogListScreen() {
  const fetchData = useCallback(
    async (
      params: RncGridFetchDataParams<SbfLogIpSortOrderField, IpLogListFilters>
    ): Promise<RncGridData<SbfLogIpResponseDto>> => {
      const payload: SbfLogIpSearchRequestDto = {
        page: params.pagination?.pageNumber ?? 0,
        size: params.pagination?.pageSize ?? 20,
        sort: params.sort,
        ...params.filters,
      }
      const apiResponse = await searchSbfLogIps(payload, params.signal)
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

  const columns: RncGridColumn<SbfLogIpResponseDto, SbfLogIpSortOrderField>[] =
    useMemo(
      () => [
        {
          key: "ip",
          header: "IP",
          minWidth: 130,
          sortable: true,
          sortKey: "IP",
          type: "string",
          editable: false,
          priority: 1,
        },
        {
          key: "query",
          header: "Query",
          minWidth: 130,
          sortable: true,
          sortKey: "QUERY",
          type: "string",
          editable: false,
          priority: 2,
        },
        {
          key: "status",
          header: "Status",
          minWidth: 80,
          sortable: true,
          sortKey: "STATUS",
          type: "string",
          editable: false,
          priority: 3,
        },
        {
          key: "country",
          header: "Country",
          minWidth: 120,
          sortable: true,
          sortKey: "COUNTRY",
          type: "string",
          editable: false,
          priority: 4,
        },
        {
          key: "city",
          header: "City",
          minWidth: 120,
          sortable: true,
          sortKey: "CITY",
          type: "string",
          editable: false,
          priority: 5,
        },
        {
          key: "regionName",
          header: "Region",
          minWidth: 120,
          sortable: true,
          sortKey: "REGIONNAME",
          type: "string",
          editable: false,
          priority: 6,
        },
        {
          key: "isp",
          header: "ISP",
          minWidth: 140,
          sortable: true,
          sortKey: "ISP",
          type: "string",
          editable: false,
          priority: 7,
        },
        {
          key: "org",
          header: "Organization",
          minWidth: 140,
          sortable: true,
          sortKey: "ORG",
          type: "string",
          editable: false,
          priority: 8,
        },
        {
          key: "mobile",
          header: "Mobile",
          minWidth: 70,
          sortable: true,
          sortKey: "MOBILE",
          type: "boolean",
          editable: false,
          priority: 9,
        },
        {
          key: "proxy",
          header: "Proxy",
          minWidth: 70,
          sortable: true,
          sortKey: "PROXY",
          type: "boolean",
          editable: false,
          priority: 10,
        },
        {
          key: "hosting",
          header: "Hosting",
          minWidth: 70,
          sortable: true,
          sortKey: "HOSTING",
          type: "boolean",
          editable: false,
          priority: 11,
        },
        {
          key: "lookupDate",
          header: "Lookup Date",
          minWidth: 100,
          sortable: true,
          sortKey: "LOOKUPDATE",
          type: "datetime",
          editable: false,
          priority: 12,
        },
        {
          key: "timezone",
          header: "Timezone",
          minWidth: 120,
          sortable: true,
          sortKey: "TIMEZONE",
          type: "string",
          editable: false,
          priority: 13,
        },
        {
          key: "countryCode",
          header: "Country Code",
          minWidth: 80,
          sortable: true,
          sortKey: "COUNTRYCODE",
          type: "string",
          editable: false,
          priority: 14,
        },
        {
          key: "createdAt",
          header: "Created At",
          minWidth: 100,
          sortable: true,
          sortKey: "CREATED_AT",
          type: "datetime",
          editable: false,
          priority: 15,
        },
        {
          key: "createdBy",
          header: "Created By",
          minWidth: 100,
          sortable: true,
          sortKey: "CREATED_BY",
          type: "string",
          editable: false,
          priority: 16,
        },
      ],
      []
    )

  const filters: RncGridFiltersConfig<SbfLogIpResponseDto, IpLogListFilters> =
    useMemo(
      () => ({
        render: (
          <View className="gap-4">
            <View className="gap-3 md:flex-row md:flex-wrap">
              <View className="md:min-w-[200px] md:flex-1">
                <RncInput id="ip" label="IP" placeholder="Search IP..." />
              </View>
              <View className="md:min-w-[200px] md:flex-1">
                <RncInput
                  id="query"
                  label="Query"
                  placeholder="Search query..."
                />
              </View>
              <View className="md:min-w-[200px] md:flex-1">
                <RncInput
                  id="status"
                  label="Status"
                  placeholder="Search status..."
                />
              </View>
              <View className="md:min-w-[200px] md:flex-1">
                <RncInput
                  id="country"
                  label="Country"
                  placeholder="Search country..."
                />
              </View>
            </View>
            <View className="gap-3 md:flex-row md:flex-wrap">
              <View className="md:min-w-[200px] md:flex-1">
                <RncInput id="city" label="City" placeholder="Search city..." />
              </View>
              <View className="md:min-w-[200px] md:flex-1">
                <RncInput id="isp" label="ISP" placeholder="Search ISP..." />
              </View>
              <View className="md:min-w-[200px] md:flex-1">
                <RncInput
                  id="org"
                  label="Organization"
                  placeholder="Search organization..."
                />
              </View>
            </View>
            <View className="gap-3 md:flex-row md:flex-wrap md:gap-4">
              <RncCheckbox id="mobile" label="Mobile" nullable />
              <RncCheckbox id="proxy" label="Proxy" nullable />
              <RncCheckbox id="hosting" label="Hosting" nullable />
            </View>
          </View>
        ),
      }),
      []
    )

  return (
    <View className="w-full gap-4 self-center p-4 md:p-6 lg:py-8">
      <Text className="font-bold text-2xl text-foreground md:text-3xl">
        IP Logs
      </Text>

      <RncGrid<SbfLogIpResponseDto, SbfLogIpSortOrderField, IpLogListFilters>
        id="ip-log-list"
        columns={columns}
        fetchData={fetchData}
        keyExtractor={(row) => row.id ?? ""}
        addEditMode="default"
        initialSort={[
          { field: SbfLogIpSortOrderField.CREATED_AT, direction: "DESC" },
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
