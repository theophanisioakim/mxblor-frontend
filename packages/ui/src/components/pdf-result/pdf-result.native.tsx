"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "../primitives/button"
import { Spinner } from "../primitives/spinner"
import { Text } from "../primitives/text"
import { View } from "../primitives/view"
import type { PdfResultProps } from "./pdf-result.shared"
import { writeAndSharePdf } from "./pdf-share.native"

export function PdfResult({
  data,
  filename,
  title,
  openLabel,
  shareUnavailableMessage,
  onError,
}: Readonly<PdfResultProps>) {
  const [opening, setOpening] = useState(false)
  const lastOpened = useRef<ArrayBuffer | undefined>(undefined)

  const open = useCallback(async () => {
    setOpening(true)
    try {
      await writeAndSharePdf(data, filename, shareUnavailableMessage)
      lastOpened.current = data
    } catch (error: unknown) {
      onError?.(
        error instanceof Error ? error.message : shareUnavailableMessage
      )
    } finally {
      setOpening(false)
    }
  }, [data, filename, onError, shareUnavailableMessage])

  useEffect(() => {
    if (lastOpened.current !== data) void open()
  }, [data, open])

  return (
    <View className="gap-3 rounded-xl border border-border bg-background p-4">
      <Text className="font-semibold text-foreground">{title}</Text>
      <Button disabled={opening} onPress={open}>
        {opening && <Spinner />}
        <Text>{openLabel}</Text>
      </Button>
    </View>
  )
}

export type { PdfResultProps } from "./pdf-result.shared"
