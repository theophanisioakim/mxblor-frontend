import { RncCheckbox, RncInput, Text, View } from "@workspace/ui"

export function UserFormFields({
  isCreateMode = false,
}: Readonly<{ isCreateMode?: boolean }>) {
  return (
    <>
      <View className="w-full gap-4 md:flex-row md:flex-wrap">
        <View className="w-full md:min-w-[250px] md:flex-1">
          <RncInput
            id="username"
            label="Username"
            placeholder="Enter username"
            required
            autoCapitalize="none"
            autoComplete="username"
            textValidationRules={{ maxLength: 255 }}
          />
        </View>
        <View className="w-full md:min-w-[250px] md:flex-1">
          <RncInput
            id="newPassword"
            label="New Password"
            type="password"
            placeholder="Enter new password"
            required={isCreateMode}
            autoComplete={isCreateMode ? "new-password" : "current-password"}
            textValidationRules={{ maxLength: 255 }}
          />
        </View>
      </View>

      <Text className="mt-2 font-semibold text-base text-foreground">
        Settings
      </Text>

      <View className="flex-row flex-wrap gap-4">
        <RncCheckbox id="active" label="Active" defaultValue={true} />
        <RncCheckbox id="shouldUpdatePassword" label="Should Update Password" />
      </View>
    </>
  )
}
