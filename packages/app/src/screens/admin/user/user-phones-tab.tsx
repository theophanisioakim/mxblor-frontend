"use client"

import {
  type SbfUserPhoneResponseDto,
  type SbfUserPhoneSearchRequestDto,
  SbfUserPhoneSortOrderField,
  searchSbfUserPhones,
  useCreateSbfUserPhone,
  useDeleteSbfUserPhone,
  useUpdateSbfUserPhone,
} from "@workspace/api-client"
import { useCrudPermissions } from "@workspace/providers"
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
import { crudPermissions } from "../../screen-permissions"

type PhoneRow = SbfUserPhoneResponseDto
type PhoneFilters = Omit<
  SbfUserPhoneSearchRequestDto,
  "page" | "size" | "sort" | "userId"
>

export function UserPhonesTab({ userId }: Readonly<{ userId: string }>) {
  const createMutation = useCreateSbfUserPhone()
  const updateMutation = useUpdateSbfUserPhone()
  const deleteMutation = useDeleteSbfUserPhone()
  const { canCreate, canUpdate, canDelete } = useCrudPermissions(
    crudPermissions.userPhone
  )
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const fetchData = useCallback(
    async (
      params: RncGridFetchDataParams<SbfUserPhoneSortOrderField, PhoneFilters>
    ): Promise<RncGridData<PhoneRow>> => {
      const f = params.filters
      const res = await searchSbfUserPhones(
        {
          userId,
          page: params.pagination?.pageNumber ?? 0,
          size: params.pagination?.pageSize ?? 20,
          sort: params.sort,
          phoneNumber: f?.phoneNumber || undefined,
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

  const columns: RncGridColumn<PhoneRow, SbfUserPhoneSortOrderField>[] =
    useMemo(
      () => [
        {
          key: "phoneNumber",
          header: "Phone",
          minWidth: 160,
          sortable: true,
          sortKey: "PHONENUMBER",
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

  const modalEdit: RncGridModalEditConfig<PhoneRow> = useMemo(
    () => ({
      title: (row) => (row.id ? "Edit Phone" : "Add Phone"),
      renderFields: (row) => (
        <View className="gap-4">
          <RncInput
            id="phoneNumber"
            label="Phone Number"
            placeholder="+1234567890"
            required
            keyboardType="phone-pad"
            autoComplete="tel"
            defaultValue={row.phoneNumber}
            textValidationRules={{ maxLength: 255 }}
            validationRules={{
              pattern: {
                value: /^[+]?[0-9\s\-()]+$/,
                message: "Invalid phone number format",
              },
            }}
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
          phoneNumber: String(formData.phoneNumber ?? ""),
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

  const selection: RncGridSelectionConfig<PhoneRow> = useMemo(
    () => ({
      persist: true,
      rowClickable: true,
      bulkActions: [
        {
          key: "delete-selected",
          icon: <Icon as={Trash2} size={16} />,
          label: "Delete selected",
          disabled: !canDelete,
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
    [deleteMutation, canDelete]
  )

  const actions: RncGridActions<PhoneRow> = useMemo(
    () => ({
      edit: { disabled: () => !canUpdate },
      delete: {
        onPress: async (row) => {
          if (!row.id) return
          await deleteMutation.mutateAsync({ id: row.id })
        },
        confirm: {
          title: "Delete Phone",
          description: (row) =>
            `Remove phone "${row.phoneNumber}"? This action cannot be undone.`,
        },
        disabled: () => !canDelete,
      },
    }),
    [deleteMutation, canUpdate, canDelete]
  )

  const filters: RncGridFiltersConfig<PhoneRow, PhoneFilters> = useMemo(
    () => ({
      render: (
        <View className="gap-3 md:flex-row md:flex-wrap">
          <View className="md:min-w-[200px] md:flex-1">
            <RncInput
              id="phoneNumber"
              label="Phone"
              placeholder="Search phone..."
            />
          </View>
        </View>
      ),
    }),
    []
  )

  return (
    <RncGrid<PhoneRow, SbfUserPhoneSortOrderField, PhoneFilters>
      id={`user-phones-${userId}`}
      columns={columns}
      fetchData={fetchData}
      keyExtractor={(row) => row.id ?? ""}
      addEditMode="modal"
      modalEdit={modalEdit}
      actions={actions}
      selection={selection}
      initialSort={[
        { field: SbfUserPhoneSortOrderField.PRIMARY, direction: "DESC" },
      ]}
      initialPagination={{
        type: "default",
        pageSize: 20,
        pageNumber: 0,
        pageSizeOptions: [20, 50, 100],
      }}
      toolbar={{
        add: { label: "Add Phone", disabled: !canCreate },
        refresh: {},
        reset: {},
      }}
      refreshTrigger={refreshTrigger}
      filters={filters}
    />
  )
}
