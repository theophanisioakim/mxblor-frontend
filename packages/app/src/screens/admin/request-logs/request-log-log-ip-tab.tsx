"use client"

import {
  getSbfLogIpById,
  type SbfLogIpResponseDto,
} from "@workspace/api-client"
import { Spinner, Text, View } from "@workspace/ui"
import { useCallback, useEffect, useState } from "react"
import { getApiErrorMessage } from "../api-error-message"
import { DetailField } from "../detail-field"

export function RequestLogLogIpTab({ logIpId }: Readonly<{ logIpId: string }>) {
  const [data, setData] = useState<SbfLogIpResponseDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(undefined)
      const result = await getSbfLogIpById(logIpId)
      setData(result)
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, "Failed to load Log IP data"))
    } finally {
      setLoading(false)
    }
  }, [logIpId])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading) {
    return (
      <View className="items-center p-4">
        <Spinner />
      </View>
    )
  }

  if (error) {
    return (
      <View className="rounded-md bg-destructive/10 p-3">
        <Text className="text-destructive">{error}</Text>
      </View>
    )
  }

  if (!data) {
    return (
      <View className="p-3">
        <Text className="text-muted-foreground">No Log IP data found.</Text>
      </View>
    )
  }

  return (
    <View className="max-w-[900px] gap-4">
      <View className="gap-3">
        <Text className="font-semibold text-base text-foreground">
          Network Info
        </Text>
        <View className="flex-row flex-wrap gap-3">
          <DetailField label="ID" value={data.id} />
          <DetailField label="IP" value={data.ip} />
          <DetailField label="Status" value={data.status} />
          <DetailField label="Message" value={data.message} />
        </View>
      </View>

      <View className="gap-3">
        <Text className="font-semibold text-base text-foreground">
          Location
        </Text>
        <View className="flex-row flex-wrap gap-3">
          <DetailField label="Country" value={data.country} />
          <DetailField label="Country Code" value={data.countryCode} />
          <DetailField label="Continent" value={data.continent} />
          <DetailField label="Continent Code" value={data.continentCode} />
          <DetailField label="Region" value={data.region} />
          <DetailField label="Region Name" value={data.regionName} />
          <DetailField label="City" value={data.city} />
          <DetailField label="District" value={data.district} />
          <DetailField label="Zip" value={data.zip} />
          <DetailField label="Latitude" value={data.lat} />
          <DetailField label="Longitude" value={data.lon} />
          <DetailField label="Timezone" value={data.timezone} />
          <DetailField label="Currency" value={data.currency} />
        </View>
      </View>

      <View className="gap-3">
        <Text className="font-semibold text-base text-foreground">
          Provider
        </Text>
        <View className="flex-row flex-wrap gap-3">
          <DetailField label="ISP" value={data.isp} />
          <DetailField label="Org" value={data.org} />
          <DetailField label="AS Name" value={data.asname} />
          <DetailField label="AS Number" value={data.asNumber} />
          <DetailField label="Reverse" value={data.reverse} />
        </View>
      </View>

      <View className="gap-3">
        <Text className="font-semibold text-base text-foreground">Flags</Text>
        <View className="flex-row flex-wrap gap-3">
          <DetailField label="Mobile" value={data.mobile} />
          <DetailField label="Proxy" value={data.proxy} />
          <DetailField label="Hosting" value={data.hosting} />
        </View>
      </View>

      <View className="gap-3">
        <Text className="font-semibold text-base text-foreground">
          Metadata
        </Text>
        <View className="flex-row flex-wrap gap-3">
          <DetailField label="Lookup Date" value={data.lookupDate} />
          <DetailField label="Created At" value={data.createdAt} />
          <DetailField label="Created By" value={data.createdBy} />
          <DetailField label="Updated At" value={data.updatedAt} />
          <DetailField label="Updated By" value={data.updatedBy} />
        </View>
      </View>
    </View>
  )
}
