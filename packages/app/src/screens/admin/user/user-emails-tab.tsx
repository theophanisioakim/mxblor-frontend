"use client"

import {
  type SbfUserEmailResponseDto,
  type SbfUserEmailSearchRequestDto,
  SbfUserEmailSortOrderField,
  searchSbfUserEmails,
  useCreateSbfUserEmail,
  useDeleteSbfUserEmail,
  useUpdateSbfUserEmail,
} from "@workspace/api-client"
import {
  Icon,
  RncCheckbox,
  RncGrid,
  type RncGridActions,
  type RncGridColumn,
  type RncGridData,
  type RncGridFetchDataParams,
  type RncGridFiltersConfig,
  type RncGridModalEditConfig,
  type RncGridSelectionConfig,
  RncInput,
  Trash2,
  View,
} from "@workspace/ui"
import { useCallback, useMemo, useState } from "react"

type EmailRow = SbfUserEmailResponseDto
type EmailFilters = Omit<
  SbfUserEmailSearchRequestDto,
  "page" | "size" | "sort" | "userId"
>

export function UserEmailsTab({ userId }: Readonly<{ userId: string }>) {
  const createMutation = useCreateSbfUserEmail()
  const updateMutation = useUpdateSbfUserEmail()
  const deleteMutation = useDeleteSbfUserEmail()
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const fetchData = useCallback(
    async (
      params: RncGridFetchDataParams<SbfUserEmailSortOrderField, EmailFilters>
    ): Promise<RncGridData<EmailRow>> => {
      const f = params.filters
      const res = await searchSbfUserEmails(
        {
          userId,
          page: params.pagination?.pageNumber ?? 0,
          size: params.pagination?.pageSize ?? 20,
          sort: params.sort,
          email: f?.email || undefined,
        },
        params.signal
      )

      return {
        data: res.content ?? [],
        pagination: {
          isEmpty: res.empty ?? true,
          isFirst: res.first ?? true,
          isLast: res.last ?? true,
          currentPageNumber: res.number ?? 0,
          currentPageElementsSize: res.numberOfElements ?? 0,
          currentPageSize: res.size ?? 0,
          totalElements: res.totalElements ?? 0,
          totalPages: res.totalPages ?? 0,
        },
      }
    },
    [userId]
  )

  const columns: RncGridColumn<EmailRow, SbfUserEmailSortOrderField>[] =
    useMemo(
      () => [
        {
          key: "email",
          header: "Email",
          minWidth: 200,
          sortable: true,
          sortKey: "EMAIL",
          type: "string",
          editable: false,
          priority: 1,
        },
        {
          key: "primary",
          header: "Primary",
          minWidth: 80,
          sortable: true,
          sortKey: "PRIMARY",
          type: "boolean",
          editable: false,
          priority: 2,
        },
        {
          key: "verified",
          header: "Verified",
          minWidth: 80,
          sortable: true,
          sortKey: "VERIFIED",
          type: "boolean",
          editable: false,
          priority: 3,
        },
        {
          key: "communication",
          header: "Communication",
          minWidth: 110,
          sortable: true,
          sortKey: "COMMUNICATION",
          type: "boolean",
          editable: false,
          priority: 4,
        },
        {
          key: "active",
          header: "Active",
          minWidth: 70,
          sortable: true,
          sortKey: "ACTIVE",
          type: "boolean",
          editable: false,
          priority: 5,
        },
        {
          key: "createdAt",
          header: "Created At",
          minWidth: 100,
          sortable: true,
          sortKey: "CREATED_AT",
          type: "datetime",
          editable: false,
          priority: 6,
        },
      ],
      []
    )

  const modalEdit: RncGridModalEditConfig<EmailRow> = useMemo(
    () => ({
      title: (row) => (row.id ? "Edit Email" : "Add Email"),
      renderFields: (row) => (
        <View className="gap-4">
          <RncInput
            id="email"
            label="Email"
            placeholder="Enter email"
            required
            autoCapitalize="none"
            keyboardType="email-address"
            defaultValue={row.email}
            textValidationRules={{ maxLength: 500 }}
          />
          <RncCheckbox
            id="primary"
            label="Primary"
            defaultValue={row.primary}
          />
          <RncCheckbox
            id="verified"
            label="Verified"
            defaultValue={row.verified}
          />
          <RncCheckbox
            id="communication"
            label="Communication"
            defaultValue={row.communication}
          />
          <RncCheckbox
            id="active"
            label="Active"
            defaultValue={row.active ?? true}
          />
        </View>
      ),
      onSave: async (row, formData) => {
        const payload = {
          userId,
          email: String(formData.email ?? ""),
          primary: Boolean(formData.primary),
          verified: Boolean(formData.verified),
          communication: Boolean(formData.communication),
          active: Boolean(formData.active),
        }
        if (row.id) {
          await updateMutation.mutateAsync({
            id: row.id,
            data: { ...payload, id: row.id, version: row.version ?? 0 },
          })
        } else {
          await createMutation.mutateAsync({ data: payload })
        }
        return true
      },
    }),
    [userId, createMutation, updateMutation]
  )

  const selection: RncGridSelectionConfig<EmailRow> = useMemo(
    () => ({
      persist: true,
      rowClickable: true,
      bulkActions: [
        {
          key: "delete-selected",
          icon: <Icon as={Trash2} size={16} />,
          label: "Delete selected",
          onPress: async (rows) => {
            await Promise.all(
              rows
                .filter((row) => row.id)
                .map((row) =>
                  deleteMutation.mutateAsync({ id: row.id as string })
                )
            )
            setRefreshTrigger((c) => c + 1)
          },
        },
      ],
    }),
    [deleteMutation]
  )

  const actions: RncGridActions<EmailRow> = useMemo(
    () => ({
      edit: {},
      delete: {
        onPress: async (row) => {
          if (!row.id) return
          await deleteMutation.mutateAsync({ id: row.id })
        },
        confirm: {
          title: "Delete Email",
          description: (row) =>
            `Remove email "${row.email}"? This action cannot be undone.`,
        },
      },
    }),
    [deleteMutation]
  )

  const filters: RncGridFiltersConfig<EmailRow, EmailFilters> = useMemo(
    () => ({
      render: (
        <View className="gap-3 md:flex-row md:flex-wrap">
          <View className="md:min-w-[200px] md:flex-1">
            <RncInput id="email" label="Email" placeholder="Search email..." />
          </View>
        </View>
      ),
    }),
    []
  )

  return (
    <RncGrid<EmailRow, SbfUserEmailSortOrderField, EmailFilters>
      id={`user-emails-${userId}`}
      columns={columns}
      fetchData={fetchData}
      keyExtractor={(row) => row.id ?? ""}
      addEditMode="modal"
      modalEdit={modalEdit}
      actions={actions}
      selection={selection}
      initialSort={[
        { field: SbfUserEmailSortOrderField.PRIMARY, direction: "DESC" },
      ]}
      initialPagination={{
        type: "default",
        pageSize: 20,
        pageNumber: 0,
        pageSizeOptions: [20, 50, 100],
      }}
      toolbar={{ add: { label: "Add Email" }, refresh: {}, reset: {} }}
      refreshTrigger={refreshTrigger}
      filters={filters}
    />
  )
}
