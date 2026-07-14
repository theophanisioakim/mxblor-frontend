"use client"

import { useQuery } from "@tanstack/react-query"
import {
  searchSbfReferences,
  useGetTExpenseCollectionTypes,
} from "@workspace/api-client"
import { useMemo } from "react"

export const NON_DISTRIBUTED_COLLECTION_TYPE_KEY =
  "MXBLOR_COLLECTION_TYPE_NONDISTRIBUTED"

export const DISTRIBUTED_COLLECTION_TYPE_KEYS = new Set([
  "MXBLOR_COLLECTION_TYPE_CAPITAL",
  "MXBLOR_COLLECTION_TYPE_MONTHLY",
  "MXBLOR_COLLECTION_TYPE_SAVINGS",
])

type CollectionTypeOptions = {
  options: { id: string; label: string }[]
  byId: Map<string, string>
  keyById: Map<string, string>
}

/**
 * Collection-type dropdown for building expenses.
 *
 * Labels come from `/texpense/collection-types` (translated). Stable keys come
 * from a reference search so the form can branch on type without guessing from
 * the label text.
 */
export function useCollectionTypeOptions(): CollectionTypeOptions {
  const { data: labels = [] } = useGetTExpenseCollectionTypes()

  const { data: refs } = useQuery({
    queryKey: ["collectionTypeRefs"],
    queryFn: () =>
      searchSbfReferences({
        page: 0,
        size: 100,
        key: "MXBLOR_COLLECTION_TYPE_",
      }),
  })

  return useMemo(() => {
    const options = labels
      .filter((option) => option.id != null)
      .map((option) => ({
        id: option.id as string,
        label: option.label ?? (option.id as string),
      }))

    const byId = new Map<string, string>()
    for (const option of options) {
      byId.set(option.id, option.label)
    }

    const keyById = new Map<string, string>()
    for (const ref of refs?.content ?? []) {
      if (ref.id && ref.key) {
        keyById.set(ref.id, ref.key)
      }
    }

    return { options, byId, keyById }
  }, [labels, refs])
}
