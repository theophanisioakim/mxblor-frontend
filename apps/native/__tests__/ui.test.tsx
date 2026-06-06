import { describe, expect, it } from "@jest/globals"
import { render } from "@testing-library/react-native"
import { Button, Text } from "@workspace/ui"

describe("@workspace/ui native primitives", () => {
  it("renders a button with text through the public UI abstraction", async () => {
    const { getByText } = await render(
      <Button>
        <Text>Press me</Text>
      </Button>
    )

    expect(getByText("Press me")).toBeTruthy()
  })
})
