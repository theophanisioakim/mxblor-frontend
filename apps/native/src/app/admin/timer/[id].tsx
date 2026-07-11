import { TimerFormScreen } from "@workspace/app"
import { useLocalSearchParams } from "expo-router"

export default function TimerForm() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return <TimerFormScreen id={id} />
}
