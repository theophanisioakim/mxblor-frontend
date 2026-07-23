"use client"

import {
  type BuildingNoteResponseDto,
  type BuildingNoteSearchRequestDto,
  BuildingNoteSortOrderField,
  searchBuildingNotes,
  useDeleteBuildingNote,
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

type BuildingNoteFilters = Omit<
  BuildingNoteSearchRequestDto,
  "page" | "size" | "sort"
>

export function BuildingNoteListScreen({
  buildingId,
}: Readonly<{ buildingId: string }>) {
  const { t } = useTranslation(["screens"])
  const router = useRouter()
  const { user } = useAuth()
  const { setItems } = useBreadcrumbs()
  const { canCreate, canUpdate, canDelete } = useCrudPermissions(
    crudPermissions.buildingNote
  )
  const deleteMutation = useDeleteBuildingNote()

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
      { label: t("buildingNote.list.title") },
    ])
  }, [setItems, t, building, buildingId])

  const fetchData = useCallback(
    async (
      params: RncGridFetchDataParams<
        BuildingNoteSortOrderField,
        BuildingNoteFilters
      >
    ): Promise<RncGridData<BuildingNoteResponseDto>> => {
      const payload: BuildingNoteSearchRequestDto = {
        page: params.pagination?.pageNumber ?? 0,
        size: params.pagination?.pageSize ?? 10,
        sort: params.sort,
        ...params.filters,
        // Scoped to this building, always — never overridable by a filter.
        buildingId,
      }

      const apiResponse = await searchBuildingNotes(payload, params.signal)
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
    BuildingNoteResponseDto,
    BuildingNoteSortOrderField
  >[] = useMemo(
    () => [
      {
        key: "detail",
        header: t("buildingNote.list.columns.detail"),
        minWidth: 300,
        sortable: true,
        sortKey: BuildingNoteSortOrderField.DETAIL,
        type: "string",
        editable: false,
        priority: 1,
      },
      {
        key: "createdAt",
        header: t("buildingNote.list.columns.createdAt"),
        minWidth: 160,
        sortable: true,
        sortKey: BuildingNoteSortOrderField.CREATED_AT,
        type: "datetime",
        editable: false,
        priority: 2,
      },
      {
        key: "createdBy",
        header: t("buildingNote.list.columns.createdBy"),
        minWidth: 140,
        sortable: true,
        sortKey: BuildingNoteSortOrderField.CREATED_BY,
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
          <View className="md:min-w-[220px] md:flex-1">
            <RncInput
              id="detail"
              label={t("buildingNote.list.filters.detail")}
              placeholder={t("buildingNote.list.filters.detailPlaceholder")}
            />
          </View>
        </View>
      </View>
    ),
    [t]
  )

  const actions: RncGridActions<BuildingNoteResponseDto> = useMemo(() => {
    const base: RncGridActions<BuildingNoteResponseDto> = {
      edit: {
        disabled: () => !canUpdate,
        route: (row) => `/buildings/${buildingId}/notes/${row.id}`,
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
          title: t("buildingNote.list.delete.title"),
          description: t("buildingNote.list.delete.description"),
        },
      },
    }
  }, [buildingId, deleteMutation, isUserRole, t, canUpdate, canDelete])

  return (
    <PermissionGuard permission={viewPermissions.buildingNote}>
      <View className="w-full gap-4 p-4 md:p-6 lg:py-8">
        <View className="flex-row items-center justify-between gap-3">
          <Text className="font-bold text-2xl text-foreground md:text-3xl">
            {t("buildingNote.list.title")}
          </Text>
          <Button
            variant="ghost"
            onPress={() => router.push(`/buildings/${buildingId}`)}
          >
            <Text>{t("buildingNote.list.back")}</Text>
          </Button>
        </View>

        <RncGrid<
          BuildingNoteResponseDto,
          BuildingNoteSortOrderField,
          BuildingNoteFilters
        >
          id={`building-note-list-${buildingId}`}
          columns={columns}
          fetchData={fetchData}
          keyExtractor={(row) => row.id ?? ""}
          addEditMode="default"
          initialSort={[
            { field: BuildingNoteSortOrderField.CREATED_AT, direction: "DESC" },
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
              route: `/buildings/${buildingId}/notes/new`,
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
