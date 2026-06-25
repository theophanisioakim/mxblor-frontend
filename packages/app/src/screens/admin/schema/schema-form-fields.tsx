import { RncCheckbox, RncInput, View } from "@workspace/ui"

export function SchemaFormFields() {
  return (
    <View className="w-full gap-4">
      <View className="gap-3 md:flex-row md:flex-wrap">
        <View className="md:min-w-[200px] md:flex-1">
          <RncInput
            id="name"
            label="Name"
            placeholder="Enter schema name"
            required
            textValidationRules={{ maxLength: 255 }}
          />
        </View>
        <View className="md:min-w-[200px] md:flex-1">
          <RncInput
            id="description"
            label="Description"
            placeholder="Enter schema description"
            required
            textValidationRules={{ maxLength: 255 }}
          />
        </View>
      </View>
      <View className="flex-row flex-wrap gap-4">
        <RncCheckbox id="active" label="Active" defaultValue={true} />
      </View>
    </View>
  )
}
