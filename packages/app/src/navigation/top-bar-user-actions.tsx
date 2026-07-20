"use client"

import { useAuth } from "@workspace/providers"
import { Link } from "@workspace/router"
import {
  Button,
  Icon,
  LogIn,
  LogOut,
  Popover,
  PopoverContent,
  PopoverTrigger,
  RncDialog,
  RncForm,
  RncSelect,
  Separator,
  Text,
  User,
  View,
} from "@workspace/ui"
import { useState } from "react"
import { LanguageSwitcher } from "./language-switcher"
import { SwitchThemeButton } from "./switch-theme-button"

type Confirmation = "logoutAll" | "logoutAllUsers" | null

/** Right-hand cluster of the top bar: language, theme, profile / auth actions. */
export function TopBarUserActions() {
  const {
    actionState,
    isAuthenticated,
    logout,
    logoutAll,
    logoutAllUsers,
    selectedSchema,
    switchSchema,
    user,
  } = useAuth()
  const [open, setOpen] = useState(false)
  const [confirmation, setConfirmation] = useState<Confirmation>(null)

  const confirmationLoading = confirmation
    ? actionState[confirmation].isLoading
    : false
  const confirmationError = confirmation
    ? actionState[confirmation].errorMessage
    : null

  const confirmBroadLogout = async () => {
    if (!confirmation) return
    const result =
      confirmation === "logoutAll" ? await logoutAll() : await logoutAllUsers()
    if (result.success) {
      setConfirmation(null)
    }
  }

  return (
    <View className="flex-row items-center gap-2">
      <LanguageSwitcher />
      <SwitchThemeButton />

      {isAuthenticated && user ? (
        <>
          <Popover onOpenChange={setOpen} open={open}>
            <PopoverTrigger asChild>
              <Button
                aria-label="Session controls"
                className="rounded-full hover:bg-accent"
                size="icon"
                variant="ghost"
              >
                <Icon as={User} size={18} />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 gap-3" side="bottom">
              <View className="gap-1">
                <Text className="font-semibold text-foreground text-sm">
                  {user.username}
                </Text>
                <Text className="text-muted-foreground text-xs">
                  Current schema: {selectedSchema}
                </Text>
              </View>

              {user.availableSchemas.length > 1 ? (
                <RncForm<{ schema: string }>
                  defaultValues={{ schema: selectedSchema ?? undefined }}
                  id="top-bar-schema-switcher"
                  key={selectedSchema}
                  onSubmit={async () => true}
                  unstyled
                >
                  <RncSelect
                    defaultValue={selectedSchema ?? undefined}
                    disabled={actionState.switchSchema.isLoading}
                    id="schema"
                    label="Switch schema"
                    onChange={async (value) => {
                      if (
                        typeof value !== "string" ||
                        value === selectedSchema
                      ) {
                        return
                      }
                      const result = await switchSchema(value)
                      if (result.success) {
                        setOpen(false)
                      }
                    }}
                    options={user.availableSchemas.map((schema) => ({
                      id: schema,
                      label: schema,
                    }))}
                  />
                </RncForm>
              ) : null}

              {actionState.switchSchema.errorMessage ? (
                <Text className="text-destructive text-xs">
                  {actionState.switchSchema.errorMessage}
                </Text>
              ) : null}

              <Separator />
              <View className="gap-1">
                <Button
                  className="w-full justify-start"
                  disabled={actionState.logout.isLoading}
                  onPress={() => {
                    setOpen(false)
                    void logout()
                  }}
                  variant="ghost"
                >
                  <Icon as={LogOut} size={16} />
                  <Text>Log out this device</Text>
                </Button>
                <Button
                  className="w-full justify-start"
                  onPress={() => {
                    setOpen(false)
                    setConfirmation("logoutAll")
                  }}
                  variant="ghost"
                >
                  <Icon as={LogOut} size={16} />
                  <Text>Log out all devices</Text>
                </Button>
                <Button
                  className="w-full justify-start"
                  onPress={() => {
                    setOpen(false)
                    setConfirmation("logoutAllUsers")
                  }}
                  variant="destructive"
                >
                  <Icon
                    as={LogOut}
                    className="text-destructive-foreground"
                    size={16}
                  />
                  <Text className="text-destructive-foreground">
                    Log out all users
                  </Text>
                </Button>
              </View>
            </PopoverContent>
          </Popover>

          <RncDialog
            confirmDisabled={confirmationLoading}
            confirmLabel={
              confirmation === "logoutAllUsers"
                ? "Log out all users"
                : "Log out all devices"
            }
            description={
              confirmation === "logoutAllUsers"
                ? "This invalidates every active user session. The backend will reject this action if you are not authorized."
                : "This invalidates every session for your account, including this device."
            }
            dismissable={!confirmationLoading}
            onCancel={() => setConfirmation(null)}
            onConfirm={() => void confirmBroadLogout()}
            onOpenChange={(nextOpen) => {
              if (!nextOpen && !confirmationLoading) setConfirmation(null)
            }}
            open={confirmation !== null}
            title={
              confirmation === "logoutAllUsers"
                ? "Log out every user?"
                : "Log out all devices?"
            }
          >
            {confirmationError ? (
              <Text className="text-destructive text-sm">
                {confirmationError}
              </Text>
            ) : null}
          </RncDialog>
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
