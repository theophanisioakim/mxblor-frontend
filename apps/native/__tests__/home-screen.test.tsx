import { describe, expect, it } from "@jest/globals"
import { render } from "@testing-library/react-native"
import { HomeScreen } from "@workspace/app"

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

    expect(getByText("Button")).toBeTruthy()
  })
})
