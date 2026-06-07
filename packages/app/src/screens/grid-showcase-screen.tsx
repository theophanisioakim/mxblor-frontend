"use client"

import {
  Icon,
  RncGrid,
  type RncGridColumn,
  type RncGridData,
  RncInput,
  RncSelect,
  RncSwitch,
  Search,
  Text,
  Trash2,
  View,
} from "@workspace/ui"
import { useCallback, useState } from "react"

type Person = {
  id: number
  name: string
  email: string
  age: number
  role: string
  active: boolean
  joined: Date
}

type PersonSort = "id" | "name" | "age" | "joined"
type PersonFilter = { q?: string; status?: string }

const ROLES = ["Engineer", "Designer", "Manager", "Analyst", "Support"]

function seedPeople(count: number): Person[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Person ${i + 1}`,
    email: `person${i + 1}@example.com`,
    age: 20 + ((i * 7) % 40),
    role: ROLES[i % ROLES.length] ?? "Engineer",
    active: i % 3 !== 0,
    joined: new Date(2020, i % 12, ((i * 3) % 27) + 1),
  }))
}

/**
 * Shared, cross-platform showcase for `RncGrid` (`@workspace/ui`). Renders on
 * both web (Next.js) and native (Expo). It exercises the grid's full feature
 * set: sorting, client-side filtering, pagination, selection + bulk actions,
 * row actions (modal edit / confirmed delete / custom), responsive column
 * collapse with an expandable detail row, a toolbar (add / refresh / reset),
 * and a separate grid demonstrating inline ("edit all") editing.
 */
export function GridShowcaseScreen() {
  const [people, setPeople] = useState<Person[]>(() => seedPeople(23))
  const [editable, setEditable] = useState<Person[]>(() => seedPeople(4))

  // clientSide grid returns the full dataset; the grid filters/sorts/pages it.
  const fetchPeople = useCallback(async (): Promise<RncGridData<Person>> => {
    return {
      data: people,
      pagination: {
        isEmpty: people.length === 0,
        isFirst: true,
        isLast: true,
        currentPageNumber: 0,
        currentPageElementsSize: people.length,
        currentPageSize: people.length,
        totalElements: people.length,
        totalPages: 1,
      },
    }
  }, [people])

  const fetchEditable = useCallback(async (): Promise<RncGridData<Person>> => {
    return {
      data: editable,
      pagination: {
        isEmpty: editable.length === 0,
        isFirst: true,
        isLast: true,
        currentPageNumber: 0,
        currentPageElementsSize: editable.length,
        currentPageSize: editable.length,
        totalElements: editable.length,
        totalPages: 1,
      },
    }
  }, [editable])

  const columns: RncGridColumn<Person, PersonSort>[] = [
    {
      key: "id",
      header: "ID",
      type: "number",
      sortable: true,
      sortKey: "id",
      minWidth: 70,
      priority: 0,
    },
    {
      key: "name",
      header: "Name",
      sortable: true,
      sortKey: "name",
      minWidth: 160,
      priority: 1,
    },
    {
      key: "age",
      header: "Age",
      type: "number",
      sortable: true,
      sortKey: "age",
      minWidth: 80,
      priority: 2,
    },
    { key: "role", header: "Role", minWidth: 130, priority: 3 },
    {
      key: "active",
      header: "Active",
      type: "boolean",
      minWidth: 90,
      priority: 4,
    },
    {
      key: "joined",
      header: "Joined",
      type: "date",
      sortable: true,
      sortKey: "joined",
      minWidth: 130,
      priority: 5,
    },
    { key: "email", header: "Email", minWidth: 220, priority: 6 },
  ]

  const editableColumns: RncGridColumn<Person, PersonSort>[] = [
    { key: "id", header: "ID", type: "number", editable: false, minWidth: 70 },
    { key: "name", header: "Name", editable: true, minWidth: 160 },
    { key: "age", header: "Age", type: "number", editable: true, minWidth: 90 },
    {
      key: "active",
      header: "Active",
      type: "boolean",
      editable: true,
      minWidth: 90,
    },
  ]

  return (
    <View className="w-full gap-10 p-6">
      <View className="gap-1">
        <Text className="font-bold text-2xl text-foreground">Data grid</Text>
        <Text className="text-muted-foreground">
          One grid, shared by the web and native apps.
        </Text>
      </View>

      <View className="gap-3">
        <Text className="font-semibold text-foreground text-lg">
          Full-featured grid
        </Text>
        <RncGrid<Person, PersonSort, PersonFilter>
          id="people-grid"
          clientSide
          keyExtractor={(row) => row.id}
          columns={columns}
          fetchData={fetchPeople}
          addEditMode="modal"
          initialSort={[{ field: "id", direction: "ASC" }]}
          initialPagination={{
            type: "default",
            pageNumber: 0,
            pageSize: 5,
            pageSizeOptions: [5, 10, 20],
          }}
          filters={{
            clientFilter: (row: Person, f) => {
              if (f.q && !row.name.toLowerCase().includes(f.q.toLowerCase())) {
                return false
              }
              if (f.status === "active" && !row.active) return false
              if (f.status === "inactive" && row.active) return false
              return true
            },
            render: (
              <View className="gap-4">
                <RncInput
                  id="q"
                  label="Search name"
                  placeholder="Type a name"
                />
                <RncSelect
                  id="status"
                  label="Status"
                  placeholder="Any status"
                  options={[
                    { id: "active", label: "Active" },
                    { id: "inactive", label: "Inactive" },
                  ]}
                />
              </View>
            ),
          }}
          toolbar={{
            add: { label: "Add person" },
            refresh: {},
            reset: {},
          }}
          selection={{
            showSelectionBar: true,
            bulkActions: [
              {
                key: "delete",
                label: "Delete selected",
                icon: <Icon as={Trash2} size={16} />,
                onPress: (rows) => {
                  const ids = new Set(rows.map((r) => r.id))
                  setPeople((prev) => prev.filter((p) => !ids.has(p.id)))
                },
              },
            ],
          }}
          actions={{
            edit: {},
            delete: {
              confirm: {
                description: (row) =>
                  `Delete ${row.name}? This cannot be undone.`,
              },
              onPress: (row) =>
                setPeople((prev) => prev.filter((p) => p.id !== row.id)),
            },
            custom: [
              {
                key: "email",
                label: "Email",
                icon: <Icon as={Search} size={16} />,
                onPress: (row) => console.debug("email", row.email),
              },
            ],
          }}
          expandable={{
            render: (row) => (
              <Text className="text-muted-foreground text-sm">
                {row.name} joined as a {row.role} in {row.joined.getFullYear()}.
              </Text>
            ),
          }}
          modalEdit={{
            title: (row) => (row.id ? `Edit ${row.name}` : "Add person"),
            renderFields: (row) => (
              <View className="gap-4">
                <RncInput
                  id="name"
                  label="Name"
                  required
                  defaultValue={row.name}
                />
                <RncInput
                  id="age"
                  label="Age"
                  type="number"
                  defaultValue={row.age}
                />
                <RncSwitch
                  id="active"
                  label="Active"
                  defaultValue={row.active}
                />
              </View>
            ),
            onSave: async (row, formData) => {
              setPeople((prev) => {
                if (row.id) {
                  return prev.map((p) =>
                    p.id === row.id ? { ...p, ...formData } : p
                  )
                }
                const nextId =
                  prev.reduce((max, p) => Math.max(max, p.id), 0) + 1
                return [
                  ...prev,
                  {
                    id: nextId,
                    name: String(formData.name ?? "New person"),
                    email: `person${nextId}@example.com`,
                    age: Number(formData.age ?? 0),
                    role: "Engineer",
                    active: Boolean(formData.active),
                    joined: new Date(),
                  },
                ]
              })
              return true
            },
          }}
        />
      </View>

      <View className="gap-3">
        <Text className="font-semibold text-foreground text-lg">
          Inline edit (edit all)
        </Text>
        <Text className="text-muted-foreground text-sm">
          Every row is editable; a dirty bar appears with unsaved changes.
        </Text>
        <RncGrid<Person, PersonSort>
          id="people-inline-grid"
          clientSide
          keyExtractor={(row) => row.id}
          columns={editableColumns}
          fetchData={fetchEditable}
          addEditMode="inline"
          initialSort={[]}
          inlineEdit={{
            mode: "all",
            onSave: async (row, updated) => {
              setEditable((prev) =>
                prev.map((p) =>
                  p.id === row.id
                    ? {
                        ...p,
                        ...updated,
                        age: updated.age != null ? Number(updated.age) : p.age,
                      }
                    : p
                )
              )
              return true
            },
          }}
        />
      </View>
    </View>
  )
}
