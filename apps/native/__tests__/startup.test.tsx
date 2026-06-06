import { describe, expect, it, jest } from "@jest/globals"
import { render } from "@testing-library/react-native"

jest.mock("expo-router", () => ({
  Stack: () => {
    const { View } = require("react-native")
    return <View testID="expo-router-stack" />
  },
}))

jest.mock("@rn-primitives/portal", () => ({
  PortalHost: () => {
    const { View } = require("react-native")
    return <View testID="portal-host" />
  },
}))

import RootLayout from "../src/app/_layout"
import Index from "../src/app/index"

describe("native startup", () => {
  it("mounts the Expo Router root layout", async () => {
    const { getByTestId } = await render(<RootLayout />)

    expect(getByTestId("expo-router-stack")).toBeTruthy()
    expect(getByTestId("portal-host")).toBeTruthy()
  })

  it("mounts the initial route and shared home screen", async () => {
    const { getByText } = await render(<Index />)

    expect(getByText("Project ready!")).toBeTruthy()
  })
})
