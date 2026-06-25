"use client"

import {
  getSbfLogRequestById,
  type SbfLogRequestResponseDto,
} from "@workspace/api-client"
import { Button, cn, Spinner, Text, View } from "@workspace/ui"
import { useCallback, useEffect, useState } from "react"
import { getApiErrorMessage } from "../api-error-message"
import { DetailField } from "../detail-field"
import { RequestLogLogIpTab } from "./request-log-log-ip-tab"

const TABS = ["Details", "Log IP"] as const
type Tab = (typeof TABS)[number]

export function RequestLogDetailScreen({
  id,
  initialData,
}: Readonly<{ id: string; initialData?: SbfLogRequestResponseDto }>) {
  const [data, setData] = useState<SbfLogRequestResponseDto | undefined>(
    initialData
  )
  const [loading, setLoading] = useState(!initialData)
  const [error, setError] = useState<string>()
  const [activeTab, setActiveTab] = useState<Tab>("Details")

  const loadData = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      setError(undefined)
      const result = await getSbfLogRequestById(id)
      setData(result)
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, "Failed to load log request"))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (!initialData && id) {
      loadData()
    }
  }, [initialData, id, loadData])

  if (!id) return null

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <Spinner />
      </View>
    )
  }

  return (
    <View className="w-full gap-4 p-4 md:p-6 lg:py-8">
      <Text className="font-bold text-2xl text-foreground md:text-3xl">
        Request Log #{id}
      </Text>

      {error && (
        <View className="rounded-md bg-destructive/10 p-3">
          <Text className="text-destructive">{error}</Text>
        </View>
      )}

      <View className="flex-row flex-wrap gap-1 border-border border-b pb-2">
        {TABS.map((tab) => (
          <Button
            key={tab}
            variant="ghost"
            size="sm"
            onPress={() => setActiveTab(tab)}
            className={cn(
              "rounded-none border-b-2 px-3",
              activeTab === tab ? "border-primary" : "border-transparent"
            )}
          >
            <Text
              className={cn(
                activeTab === tab
                  ? "font-semibold text-primary"
                  : "text-foreground"
              )}
            >
              {tab}
            </Text>
          </Button>
        ))}
      </View>

      {activeTab === "Details" && data && (
        <View className="max-w-[900px] gap-4">
          <View className="gap-3">
            <Text className="font-semibold text-base text-foreground">
              Request Info
            </Text>
            <View className="flex-row flex-wrap gap-3">
              <DetailField label="ID" value={data.id} />
              <DetailField label="URL" value={data.url} />
              <DetailField label="Method" value={data.method} />
              <DetailField label="Hostname" value={data.hostname} />
              <DetailField label="IP" value={data.ip} />
              <DetailField label="User Agent" value={data.userAgent} />
              <DetailField
                label="Query Parameters"
                value={data.queryParameters}
              />
              <DetailField label="Trace ID" value={data.traceId} />
            </View>
          </View>

          <View className="gap-3">
            <Text className="font-semibold text-base text-foreground">
              Response Info
            </Text>
            <View className="flex-row flex-wrap gap-3">
              <DetailField label="Status Code" value={data.statusCode} />
              <DetailField label="Duration (ms)" value={data.duration} />
              <DetailField label="Succeeded" value={data.requestSucceeded} />
              <DetailField label="Error Message" value={data.errorMessage} />
              <DetailField label="Error Stack" value={data.errorStack} />
            </View>
          </View>

          <View className="gap-3">
            <Text className="font-semibold text-base text-foreground">
              Auth / Access
            </Text>
            <View className="flex-row flex-wrap gap-3">
              <DetailField
                label="Token Supplied"
                value={data.isTokenSupplied}
              />
              <DetailField label="URL Public" value={data.isUrlPublic} />
              <DetailField
                label="User Authenticated"
                value={data.isUserAuthenticated}
              />
              <DetailField label="User ID" value={data.userId} />
              <DetailField label="Log IP ID" value={data.logIpId} />
              <DetailField
                label="Lookup Completed"
                value={data.lookupCompleted}
              />
            </View>
          </View>

          <View className="gap-3">
            <Text className="font-semibold text-base text-foreground">
              Headers / Body
            </Text>
            <View className="flex-row flex-wrap gap-3">
              <DetailField
                label="Request Headers"
                value={data.requestHeaders}
              />
              <DetailField label="Request Body" value={data.requestBody} />
              <DetailField
                label="Response Headers"
                value={data.responseHeaders}
              />
              <DetailField label="Response Body" value={data.responseBody} />
            </View>
          </View>

          <View className="gap-3">
            <Text className="font-semibold text-base text-foreground">
              Metadata
            </Text>
            <View className="flex-row flex-wrap gap-3">
              <DetailField
                label="Request Timestamp"
                value={data.requestTimestamp}
              />
              <DetailField label="Created At" value={data.createdAt} />
              <DetailField label="Created By" value={data.createdBy} />
              <DetailField label="Updated At" value={data.updatedAt} />
              <DetailField label="Updated By" value={data.updatedBy} />
              <DetailField label="Version" value={data.version} />
            </View>
          </View>
        </View>
      )}

      {activeTab === "Log IP" && data?.logIpId && (
        <RequestLogLogIpTab logIpId={data.logIpId} />
      )}

      {activeTab === "Log IP" && !data?.logIpId && (
        <View className="p-3">
          <Text className="text-muted-foreground">
            No Log IP associated with this request.
          </Text>
        </View>
      )}
    </View>
  )
}
