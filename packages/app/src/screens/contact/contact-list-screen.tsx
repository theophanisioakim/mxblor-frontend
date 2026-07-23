"use client"

import {
  type ContactResponseDto,
  type ContactSearchRequestDto,
  ContactSortOrderField,
  searchContacts,
  useDeleteContact,
} from "@workspace/api-client"
import { useTranslation } from "@workspace/i18n"
import { useAuth, useCrudPermissions } from "@workspace/providers"
import { useRouter } from "@workspace/router"
import {
  RncGrid,
  type RncGridActions,
  type RncGridColumn,
  type RncGridData,
  type RncGridFetchDataParams,
  RncInput,
  Text,
  View,
} from "@workspace/ui"
import { useCallback, useMemo } from "react"
import { PermissionGuard } from "../permission-guard"
import { crudPermissions, viewPermissions } from "../screen-permissions"

type ContactListFilters = Omit<
  ContactSearchRequestDto,
  "page" | "size" | "sort"
>

export function ContactListScreen() {
  const { t } = useTranslation(["screens"])
  const router = useRouter()
  const { user } = useAuth()
  const { canCreate, canUpdate, canDelete } = useCrudPermissions(
    crudPermissions.contact
  )
  const deleteMutation = useDeleteContact()

  const isUserRole = user?.roleDescriptions?.includes("user") ?? false

  const fetchData = useCallback(
    async (
      params: RncGridFetchDataParams<ContactSortOrderField, ContactListFilters>
    ): Promise<RncGridData<ContactResponseDto>> => {
      const payload: ContactSearchRequestDto = {
        page: params.pagination?.pageNumber ?? 0,
        size: params.pagination?.pageSize ?? 10,
        sort: params.sort,
        ...params.filters,
      }

      const apiResponse = await searchContacts(payload, params.signal)
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

  const columns: RncGridColumn<ContactResponseDto, ContactSortOrderField>[] =
    useMemo(
      () => [
        {
          // Composed server-side, so every screen shows the same name.
          key: "fullName",
          header: t("contact.list.columns.name"),
          minWidth: 220,
          sortable: true,
          sortKey: ContactSortOrderField.LASTNAME,
          type: "string",
          editable: false,
          priority: 1,
        },
        {
          key: "firstName",
          header: t("contact.list.columns.firstName"),
          minWidth: 150,
          sortable: true,
          sortKey: ContactSortOrderField.FIRSTNAME,
          type: "string",
          editable: false,
          priority: 3,
        },
        {
          key: "lastName",
          header: t("contact.list.columns.lastName"),
          minWidth: 150,
          sortable: true,
          sortKey: ContactSortOrderField.LASTNAME,
          type: "string",
          editable: false,
          priority: 2,
        },
      ],
      [t]
    )

  const filters = useMemo(
    () => (
      <View className="gap-4">
        <View className="gap-3 md:flex-row md:flex-wrap md:items-end">
          <View className="md:min-w-[180px] md:flex-1">
            <RncInput
              id="firstName"
              label={t("contact.list.filters.firstName")}
              placeholder={t("contact.list.filters.firstNamePlaceholder")}
            />
          </View>
          <View className="md:min-w-[180px] md:flex-1">
            <RncInput
              id="lastName"
              label={t("contact.list.filters.lastName")}
              placeholder={t("contact.list.filters.lastNamePlaceholder")}
            />
          </View>
        </View>
      </View>
    ),
    [t]
  )

  const actions: RncGridActions<ContactResponseDto> = useMemo(() => {
    const base: RncGridActions<ContactResponseDto> = {
      edit: {
        disabled: () => !canUpdate,
        route: (row) => `/contacts/${row.id}`,
      },
    }
    // Same role rule as buildings: the `user` role does not delete.
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
          title: t("contact.list.delete.title"),
          description: (row) =>
            t("contact.list.delete.description", {
              name: row.fullName ?? row.id,
            }),
        },
      },
    }
  }, [deleteMutation, isUserRole, t, canUpdate, canDelete])

  return (
    <PermissionGuard permission={viewPermissions.contact}>
      <View className="w-full gap-4 self-center p-4 md:p-6 lg:py-8">
        <Text className="font-bold text-2xl text-foreground md:text-3xl">
          {t("contact.list.title")}
        </Text>

        <RncGrid<ContactResponseDto, ContactSortOrderField, ContactListFilters>
          id="contact-list"
          columns={columns}
          fetchData={fetchData}
          keyExtractor={(row) => row.id ?? ""}
          addEditMode="default"
          initialSort={[
            { field: ContactSortOrderField.LASTNAME, direction: "ASC" },
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
            add: { disabled: !canCreate, route: "/contacts/new" },
            refresh: {},
            reset: {},
          }}
          onNavigate={router.push}
        />
      </View>
    </PermissionGuard>
  )
}
