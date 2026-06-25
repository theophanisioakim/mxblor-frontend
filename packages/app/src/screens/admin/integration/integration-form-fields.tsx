import { RncCheckbox, RncInput, View } from "@workspace/ui"

export function IntegrationFormFields() {
  return (
    <View className="w-full gap-3">
      <RncInput
        id="baseUrl"
        label="Base URL"
        placeholder="https://api.example.com"
        required
        textValidationRules={{ maxLength: 255 }}
      />
      <RncInput
        id="endpoint"
        label="Endpoint"
        placeholder="/api/v1/resource"
        required
        textValidationRules={{ maxLength: 255 }}
      />
      <RncInput
        id="method"
        label="Method"
        placeholder="GET, POST, PUT..."
        required
        textValidationRules={{ maxLength: 255 }}
      />
      <RncInput
        id="timeoutSecs"
        label="Timeout (seconds)"
        type="number"
        placeholder="30"
        required
      />
      <RncInput
        id="className"
        label="Class Name"
        placeholder="com.example.Service"
        required
        textValidationRules={{ maxLength: 255 }}
      />
      <RncInput
        id="methodName"
        label="Method Name"
        placeholder="fetchData"
        required
        textValidationRules={{ maxLength: 255 }}
      />
      <RncInput
        id="description"
        label="Description"
        placeholder="Integration description..."
      />
      <RncInput id="failedCount" label="Failed Count" type="number" />
      <RncCheckbox id="active" label="Active" />
    </View>
  )
}
