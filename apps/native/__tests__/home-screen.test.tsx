import { describe, expect, it, jest } from "@jest/globals"
import { render } from "@testing-library/react-native"
import { HomeScreen } from "@workspace/app"
import type React from "react"

jest.mock("expo-router", () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
}))

describe("HomeScreen", () => {
  it("renders the shared app copy", async () => {
    const { getByText } = await render(<HomeScreen />)

    expect(getByText("Project ready!")).toBeTruthy()
    expect(
      getByText("One screen, shared by the web and native apps.")
    ).toBeTruthy()
  })

  it("renders the shared button label", async () => {
    const { getByText } = await render(<HomeScreen />)

    expect(getByText("Example button")).toBeTruthy()
  })

  it("renders the shared navigation label", async () => {
    const { getByText } = await render(<HomeScreen />)

    expect(getByText("View form components")).toBeTruthy()
  })
})
