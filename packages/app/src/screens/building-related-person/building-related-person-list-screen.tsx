"use client"

import {
  type BuildingRelatedPersonResponseDto,
  type BuildingRelatedPersonSearchRequestDto,
  BuildingRelatedPersonSortOrderField,
  searchBuildingRelatedPersons,
  useDeleteBuildingRelatedPerson,
  useGetBuildingById,
} from "@workspace/api-client"
import { useTranslation } from "@workspace/i18n"
import {
  useAuth,
  useBreadcrumbs,
  useCrudPermissions,
} from "@workspace/providers"
import { useRouter } from "@workspace/router"
import {
  Button,
  RncGrid,
  type RncGridActions,
  type RncGridColumn,
  type RncGridData,
  type RncGridFetchDataParams,
  RncInput,
  Text,
  View,
} from "@workspace/ui"
import { useCallback, useEffect, useMemo } from "react"
import { PermissionGuard } from "../permission-guard"
import { crudPermissions, viewPermissions } from "../screen-permissions"

type RelatedPersonFilters = Omit<
  BuildingRelatedPersonSearchRequestDto,
  "page" | "size" | "sort"
>

export function BuildingRelatedPersonListScreen({
  buildingId,
}: Readonly<{ buildingId: string }>) {
  const { t } = useTranslation(["screens"])
  const router = useRouter()
  const { user } = useAuth()
  const { setItems } = useBreadcrumbs()
  const { canCreate, canUpdate, canDelete } = useCrudPermissions(
    crudPermissions.buildingRelatedPerson
  )
  const deleteMutation = useDeleteBuildingRelatedPerson()

  const isUserRole = user?.roleDescriptions?.includes("user") ?? false
  const { data: building } = useGetBuildingById(buildingId, {
    query: { enabled: !!buildingId },
  })

  useEffect(() => {
    setItems([
      { label: "Home", href: "/" },
      { label: "Buildings", href: "/buildings" },
      {
        label: building?.name ?? building?.code ?? buildingId,
        href: `/buildings/${buildingId}`,
      },
      { label: t("relatedPerson.list.title") },
    ])
  }, [setItems, t, building, buildingId])

  const fetchData = useCallback(
    async (
      params: RncGridFetchDataParams<
        BuildingRelatedPersonSortOrderField,
        RelatedPersonFilters
      >
    ): Promise<RncGridData<BuildingRelatedPersonResponseDto>> => {
      const payload: BuildingRelatedPersonSearchRequestDto = {
        page: params.pagination?.pageNumber ?? 0,
        size: params.pagination?.pageSize ?? 10,
        sort: params.sort,
        ...params.filters,
        buildingId,
      }

      const apiResponse = await searchBuildingRelatedPersons(
        payload,
        params.signal
      )
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
    [buildingId]
  )

  const columns: RncGridColumn<
    BuildingRelatedPersonResponseDto,
    BuildingRelatedPersonSortOrderField
  >[] = useMemo(
    () => [
      {
        // Resolved server-side, so it reads the same as on the contacts screens.
        key: "contactName",
        header: t("relatedPerson.list.columns.contact"),
        minWidth: 200,
        sortable: false,
        type: "string",
        editable: false,
        priority: 1,
      },
      {
        key: "relatedPersonTypeName",
        header: t("relatedPerson.list.columns.type"),
        minWidth: 180,
        sortable: false,
        type: "string",
        editable: false,
        priority: 2,
      },
      {
        key: "relation",
        header: t("relatedPerson.list.columns.relation"),
        minWidth: 200,
        sortable: true,
        sortKey: BuildingRelatedPersonSortOrderField.RELATION,
        type: "string",
        editable: false,
        priority: 3,
      },
    ],
    [t]
  )

  const filters = useMemo(
    () => (
      <View className="gap-4">
        <View className="gap-3 md:flex-row md:flex-wrap md:items-end">
          <View className="md:min-w-[200px] md:flex-1">
            <RncInput
              id="relation"
              label={t("relatedPerson.list.filters.relation")}
              placeholder={t("relatedPerson.list.filters.relationPlaceholder")}
            />
          </View>
        </View>
      </View>
    ),
    [t]
  )

  const actions: RncGridActions<BuildingRelatedPersonResponseDto> =
    useMemo(() => {
      const base: RncGridActions<BuildingRelatedPersonResponseDto> = {
        edit: {
          disabled: () => !canUpdate,
          route: (row) => `/buildings/${buildingId}/related-people/${row.id}`,
        },
      }
      if (isUserRole) return base

      return {
        ...base,
        delete: {
          disabled: () => !canDelete,
          onPress: async (row) => {
            if (!row.id) return
            await deleteMutation.mutateAsync({ id: row.id })
          },
          confirm: {
            title: t("relatedPerson.list.delete.title"),
            description: (row) =>
              t("relatedPerson.list.delete.description", {
                name: row.contactName ?? row.relation ?? row.id,
              }),
          },
        },
      }
    }, [buildingId, deleteMutation, isUserRole, t, canUpdate, canDelete])

  return (
    <PermissionGuard permission={viewPermissions.buildingRelatedPerson}>
      <View className="w-full gap-4 p-4 md:p-6 lg:py-8">
        <View className="flex-row items-center justify-between gap-3">
          <Text className="font-bold text-2xl text-foreground md:text-3xl">
            {t("relatedPerson.list.title")}
          </Text>
          <Button
            variant="ghost"
            onPress={() => router.push(`/buildings/${buildingId}`)}
          >
            <Text>{t("relatedPerson.list.back")}</Text>
          </Button>
        </View>

        <RncGrid<
          BuildingRelatedPersonResponseDto,
          BuildingRelatedPersonSortOrderField,
          RelatedPersonFilters
        >
          id={`building-related-person-list-${buildingId}`}
          columns={columns}
          fetchData={fetchData}
          keyExtractor={(row) => row.id ?? ""}
          addEditMode="default"
          initialSort={[
            {
              field: BuildingRelatedPersonSortOrderField.RELATION,
              direction: "ASC",
            },
          ]}
          initialPagination={{
            type: "default",
            pageSize: 10,
            pageNumber: 0,
            pageSizeOptions: [10, 25, 50],
          }}
          actions={actions}
          filters={{ render: filters }}
          toolbar={{
            add: {
              disabled: !canCreate,
              route: `/buildings/${buildingId}/related-people/new`,
            },
            refresh: {},
            reset: {},
          }}
          onNavigate={router.push}
        />
      </View>
    </PermissionGuard>
  )
}
