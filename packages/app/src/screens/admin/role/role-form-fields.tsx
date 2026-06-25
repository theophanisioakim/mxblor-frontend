import { RncInput, View } from "@workspace/ui"

export function RoleFormFields() {
  return (
    <View className="w-full gap-4 md:max-w-[500px]">
      <RncInput
        id="description"
        label="Description"
        placeholder="Enter role description"
        required
        textValidationRules={{ maxLength: 255 }}
      />
    </View>
  )
}
