"use client"

import { useGetTCollectionPaymentChannels } from "@workspace/api-client"
import { useMemo } from "react"

type PaymentChannelOptions = {
  options: { id: string; label: string }[]
  byId: Map<string, string>
}

export function usePaymentChannelOptions(): PaymentChannelOptions {
  const { data = [] } = useGetTCollectionPaymentChannels()

  return useMemo(() => {
    const options = data
      .filter((option) => option.id != null)
      .map((option) => ({
        id: option.id as string,
        label: option.label ?? (option.id as string),
      }))

    const byId = new Map<string, string>()
    for (const option of options) {
      byId.set(option.id, option.label)
    }

    return { options, byId }
  }, [data])
}
