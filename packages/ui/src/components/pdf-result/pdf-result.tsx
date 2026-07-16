"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "../primitives/button"
import { Text } from "../primitives/text"
import { View } from "../primitives/view"
import type { PdfResultProps } from "./pdf-result.shared"
import { createPdfObjectUrl } from "./pdf-result-url"

export function PdfResult({
  data,
  filename,
  title,
  downloadLabel,
  previewTitle,
}: Readonly<PdfResultProps>) {
  const [url, setUrl] = useState<string>()

  useEffect(() => {
    const objectUrl = createPdfObjectUrl(data)
    setUrl(objectUrl.url)
    return () => {
      objectUrl.revoke()
    }
  }, [data])

  const download = useCallback(() => {
    if (!url) return
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = filename
    anchor.click()
  }, [filename, url])

  return (
    <View className="gap-3 rounded-xl border border-border bg-background p-4">
      <View className="items-start justify-between gap-3 md:flex-row md:items-center">
        <Text className="font-semibold text-foreground">{title}</Text>
        <Button disabled={!url} onPress={download}>
          <Text>{downloadLabel}</Text>
        </Button>
      </View>
      {url && (
        <iframe
          className="h-[70vh] min-h-[520px] w-full rounded-md border border-border"
          src={url}
          title={previewTitle}
        />
      )}
    </View>
  )
}

export type { PdfResultProps } from "./pdf-result.shared"
