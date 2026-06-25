import { RncCheckbox, RncInput, View } from "@workspace/ui"

export function TimerFormFields({
  isCreateMode = false,
}: Readonly<{ isCreateMode?: boolean }>) {
  const isEditMode = !isCreateMode
  return (
    <View className="w-full gap-4">
      <View className="gap-3 md:flex-row md:flex-wrap">
        <View className="md:min-w-[200px] md:flex-1">
          <RncInput
            id="key"
            label="Key"
            placeholder="Enter timer key"
            required
            readOnly={isEditMode}
            textValidationRules={{ maxLength: 255 }}
          />
        </View>
        <View className="md:min-w-[200px] md:flex-1">
          <RncInput
            id="cron"
            label="Cron"
            placeholder="Enter cron expression"
            required
            textValidationRules={{ maxLength: 255 }}
          />
        </View>
      </View>
      <RncInput
        id="description"
        label="Description"
        placeholder="Enter description"
        textValidationRules={{ maxLength: 255 }}
      />
      <View className="gap-3 md:flex-row md:flex-wrap">
        <View className="md:min-w-[200px] md:flex-1">
          <RncInput
            id="failedCount"
            label="Failed Count"
            type="number"
            placeholder="0"
            readOnly={isEditMode}
          />
        </View>
        <View className="md:min-w-[200px] md:flex-1">
          <RncInput
            id="lastExecution"
            label="Last Execution"
            placeholder="Last execution date"
            readOnly={isEditMode}
          />
        </View>
      </View>
      <RncCheckbox id="active" label="Active" defaultValue={true} />
    </View>
  )
}
