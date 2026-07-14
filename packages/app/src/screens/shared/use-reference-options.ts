"use client"

import type {
  DistributionCalcTypeOptionDto,
  SelectOptionDto,
} from "@workspace/api-client"
import {
  useGetBuildingDistributionCalcTypes,
  useGetBuildingRelatedPersonTypes,
  useGetBuildingUnitContactTypes,
  useGetContactAddressTypes,
  useGetContactEmailTypes,
  useGetContactPhoneNumberTypes,
  useGetTBankAccountAccountTypes,
  useGetTBankAccountTransactionTypes,
} from "@workspace/api-client"
import { useMemo } from "react"

/**
 * The lookup lists the forms build their type dropdowns from.
 *
 * Each comes from its **own** endpoint (`/contact/email-types`,
 * `/building-unit/contact-types`, …) rather than one generic
 * "give me any reference type" call. That is deliberate: permissions are keyed on
 * (endpoint, method), so a separate path is the only way a role can be granted
 * one lookup without being granted every other lookup in the system. The server
 * still resolves the labels into the user's language — a raw reference row only
 * carries a label id, so options built from one would read `MXBLOR_EMAIL_TYPE_HOME`.
 *
 * The hooks below are thin wrappers that normalise the shared option shape; add
 * a new one only when its endpoint exists, so no screen depends on a route that
 * isn't there.
 */
type ReferenceOptions = {
  options: { id: string; label: string; filterString?: string }[]
  byId: Map<string, string>
}

function toOptions(selectOptions: SelectOptionDto[]): ReferenceOptions {
  const options = selectOptions
    .filter((option) => option.id != null)
    .map((option) => ({
      id: option.id as string,
      label: option.label ?? (option.id as string),
      filterString: option.filterString,
    }))

  const byId = new Map<string, string>()
  for (const option of options) {
    byId.set(option.id, option.label)
  }

  return { options, byId }
}

/** Home / Work / Personal / Other — a contact's email rows. */
export function useContactEmailTypeOptions(): ReferenceOptions {
  const { data = [] } = useGetContactEmailTypes()
  return useMemo(() => toOptions(data), [data])
}

/** Home / Work / Mobile / Fax / Other — a contact's phone rows. */
export function useContactPhoneNumberTypeOptions(): ReferenceOptions {
  const { data = [] } = useGetContactPhoneNumberTypes()
  return useMemo(() => toOptions(data), [data])
}

/** Home / Work / Business — a contact's address rows. */
export function useContactAddressTypeOptions(): ReferenceOptions {
  const { data = [] } = useGetContactAddressTypes()
  return useMemo(() => toOptions(data), [data])
}

/** Owner / Tenant / Contact person / … — a building unit's people. */
export function useBuildingUnitContactTypeOptions(): ReferenceOptions {
  const { data = [] } = useGetBuildingUnitContactTypes()
  return useMemo(() => toOptions(data), [data])
}

/** Committee president / caretaker / lawyer / … — a building's related people. */
export function useBuildingRelatedPersonTypeOptions(): ReferenceOptions {
  const { data = [] } = useGetBuildingRelatedPersonTypes()
  return useMemo(() => toOptions(data), [data])
}

/** Current / Savings / Deposit / … — a bank account's type. */
export function useBankAccountTypeOptions(): ReferenceOptions {
  const { data = [] } = useGetTBankAccountAccountTypes()
  return useMemo(() => toOptions(data), [data])
}

/**
 * Balance b/f / Administrative / the transfers / Other — the transaction types a
 * user may enter on the bank-account screen.
 *
 * The endpoint serves only the *manual* types, on purpose: payment and collection
 * rows are written by the system to record the bank side of a receipt, and the
 * save rejects an attempt to enter one. A dropdown offering them would be
 * offering something that is then refused.
 */
export function useTransactionTypeOptions(): ReferenceOptions {
  const { data = [] } = useGetTBankAccountTransactionTypes()
  return useMemo(() => toOptions(data), [data])
}

/**
 * The distribution table's calculation methods.
 *
 * Deliberately *not* shaped like the lookups above. The form does not merely
 * display these — it has to act on the one the user picks, applying the right
 * formula (split evenly, weight by confined space, …), and it cannot tell them
 * apart by a label that changes with the language. So the endpoint returns a
 * stable `key` alongside the id, and the form switches on that; see
 * `distribution-calc.ts`.
 */
export function useDistributionCalcTypeOptions(): {
  options: DistributionCalcTypeOptionDto[]
  keyById: Map<string, string>
} {
  const { data = [] } = useGetBuildingDistributionCalcTypes()

  return useMemo(() => {
    const keyById = new Map<string, string>()
    for (const option of data) {
      if (option.id && option.key) {
        keyById.set(option.id, option.key)
      }
    }
    return { options: data, keyById }
  }, [data])
}
