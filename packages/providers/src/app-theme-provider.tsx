"use client"

import { myLocalStorage, StorageKeys } from "@workspace/storage"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import type { ReactNode } from "react"
import { useCallback, useEffect, useMemo } from "react"

export type ThemeValue = "light" | "dark"

interface AppThemeContextValue {
  theme: ThemeValue
  setTheme: (theme: ThemeValue) => void
  toggle: () => void
}

export interface AppThemeProviderProps {
  children: ReactNode
}

export function AppThemeProvider({
  children,
}: Readonly<AppThemeProviderProps>) {
  const handleThemeChange = useCallback((nextTheme: string) => {
    if (nextTheme === "light" || nextTheme === "dark") {
      myLocalStorage.setItem(StorageKeys.THEME, nextTheme)
    }
  }, [])

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey={StorageKeys.THEME}
    >
      <ThemeStorageSync onThemeChange={handleThemeChange} />
      <ThemeHotkey />
      {children}
    </NextThemesProvider>
  )
}

export function useAppTheme(): AppThemeContextValue {
  const themeSetting = useTheme()
  const theme = normalizeTheme(themeSetting.resolvedTheme)

  const setTheme = useCallback(
    (nextTheme: ThemeValue) => themeSetting.setTheme(nextTheme),
    [themeSetting]
  )

  const toggle = useCallback(() => {
    themeSetting.setTheme(theme === "dark" ? "light" : "dark")
  }, [themeSetting, theme])

  return useMemo(
    () => ({
      theme,
      setTheme,
      toggle,
    }),
    [theme, setTheme, toggle]
  )
}

function normalizeTheme(theme: string | undefined): ThemeValue {
  return theme === "dark" ? "dark" : "light"
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

function ThemeHotkey() {
  const { toggle } = useAppTheme()

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) {
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      if (event.key.toLowerCase() !== "d") {
        return
      }

      if (isTypingTarget(event.target)) {
        return
      }

      toggle()
    }

    globalThis.addEventListener("keydown", onKeyDown)

    return () => {
      globalThis.removeEventListener("keydown", onKeyDown)
    }
  }, [toggle])

  return null
}

function ThemeStorageSync({
  onThemeChange,
}: Readonly<{ onThemeChange: (theme: string) => void }>) {
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    if (resolvedTheme) {
      onThemeChange(resolvedTheme)
    }
  }, [resolvedTheme, onThemeChange])

  return null
}
