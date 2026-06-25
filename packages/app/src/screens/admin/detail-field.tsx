import { Text, View } from "@workspace/ui"

/** Read-only label/value pair used by the admin detail screens. */
export function DetailField({
  label,
  value,
}: Readonly<{ label: string; value?: string | number | boolean | null }>) {
  const display = value === null || value === undefined ? "-" : String(value)
  return (
    <View className="min-w-[200px] flex-1 gap-1">
      <Text className="font-medium text-muted-foreground text-xs">{label}</Text>
      <Text className="text-foreground text-sm">{display}</Text>
    </View>
  )
}
