import { myLocalStorage, StorageKeys } from "@workspace/storage"
import type { ReactNode } from "react"
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"
import { useColorScheme } from "react-native"

export type ThemeValue = "light" | "dark"

interface AppThemeContextValue {
  theme: ThemeValue
  setTheme: (theme: ThemeValue) => void
  toggle: () => void
}

const AppThemeContext = createContext<AppThemeContextValue | null>(null)

export interface AppThemeProviderProps {
  children: ReactNode
}

export function AppThemeProvider({
  children,
}: Readonly<AppThemeProviderProps>) {
  const colorScheme = useColorScheme()
  const [theme, setTheme] = useState<ThemeValue>(() =>
    getInitialTheme(colorScheme)
  )

  const setThemeState = useCallback((nextTheme: ThemeValue) => {
    setTheme(nextTheme)
    myLocalStorage.setItem(StorageKeys.THEME, nextTheme)
  }, [])

  const toggle = useCallback(() => {
    setTheme((current) => {
      const nextTheme = current === "dark" ? "light" : "dark"
      myLocalStorage.setItem(StorageKeys.THEME, nextTheme)
      return nextTheme
    })
  }, [])

  const value = useMemo<AppThemeContextValue>(
    () => ({
      theme,
      setTheme: setThemeState,
      toggle,
    }),
    [theme, setThemeState, toggle]
  )

  return (
    <AppThemeContext.Provider value={value}>
      {children}
    </AppThemeContext.Provider>
  )
}

export function useAppTheme(): AppThemeContextValue {
  const context = useContext(AppThemeContext)
  if (!context) {
    throw new Error("useAppTheme must be used within AppThemeProvider")
  }
  return context
}

function getInitialTheme(systemScheme: ReturnType<typeof useColorScheme>) {
  const storedTheme = myLocalStorage.getItem(StorageKeys.THEME)

  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme
  }

  return systemScheme === "dark" ? "dark" : "light"
}
