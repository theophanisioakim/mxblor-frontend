import { describe, expect, it, jest } from "@jest/globals"
import { render } from "@testing-library/react-native"
import type React from "react"
import RootLayout from "../src/app/_layout"
import Index from "../src/app/index"

jest.mock("expo-router", () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
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
