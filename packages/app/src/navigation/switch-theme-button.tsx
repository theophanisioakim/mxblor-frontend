"use client"

import { useAppTheme } from "@workspace/providers"
import { Button, Icon, Moon, Sun } from "@workspace/ui"
import { useEffect, useState } from "react"

/** Toggles between light and dark theme via the shared app theme provider. */
export function SwitchThemeButton() {
  const { theme, toggle } = useAppTheme()
  // The resolved theme is only known on the client, so render the light-mode
  // icon until mounted to keep the first client render identical to the server
  // (avoids a next-themes hydration mismatch).
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  const isDark = mounted && theme === "dark"

  return (
    <Button
      aria-label="Change theme"
      className="rounded-full hover:bg-accent"
      onPress={toggle}
      size="icon"
      variant="ghost"
    >
      <Icon as={isDark ? Moon : Sun} size={18} />
    </Button>
  )
}
