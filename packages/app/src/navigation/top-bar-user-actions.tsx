"use client"

import { useAuth } from "@workspace/providers"
import { Link } from "@workspace/router"
import { Button, Icon, LogIn, LogOut, Text, User, View } from "@workspace/ui"
import { LanguageSwitcher } from "./language-switcher"
import { SwitchThemeButton } from "./switch-theme-button"

/** Right-hand cluster of the top bar: language, theme, profile / auth actions. */
export function TopBarUserActions() {
  const { isAuthenticated, logout } = useAuth()

  return (
    <View className="flex-row items-center gap-2">
      <LanguageSwitcher />
      <SwitchThemeButton />

      {isAuthenticated ? (
        <>
          <Button
            aria-label="User profile"
            className="rounded-full hover:bg-accent"
            size="icon"
            variant="ghost"
          >
            <Icon as={User} size={18} />
          </Button>
          <Button
            aria-label="Logout"
            className="rounded-full hover:bg-accent"
            onPress={logout}
            size="icon"
            variant="ghost"
          >
            <Icon as={LogOut} size={18} />
          </Button>
        </>
      ) : (
        <Button asChild className="hover:bg-accent" size="sm" variant="ghost">
          <Link href="/login">
            <Icon as={LogIn} size={18} />
            <Text className="text-sm">Login</Text>
          </Link>
        </Button>
      )}
    </View>
  )
}
