import { beforeEach, describe, expect, it, jest } from "@jest/globals"
import { render } from "@testing-library/react-native"
import { LandingScreen } from "@workspace/app"
import type React from "react"

let mockIsAuthenticated = false

jest.mock("@workspace/providers", () => ({
  useAuth: () => ({ isAuthenticated: mockIsAuthenticated }),
}))

jest.mock("@workspace/router", () => ({
  LinkButton: ({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) => {
    const { Text } = require("react-native")
    return <Text accessibilityLabel={`link:${href}`}>{children}</Text>
  },
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}))

jest.mock("@workspace/i18n", () => {
  const translations: Record<string, string> = {
    "landing.actions.contact": "Book a demonstration",
    "landing.actions.dashboard": "Open dashboard",
    "landing.actions.login": "Sign in to MXBLOR",
    "landing.contact.company": "Visit M. Halloumas C.C. Ltd",
    "landing.contact.email": "Email us",
    "landing.contact.phone": "Call us",
    "landing.description": "Professional building management in one place.",
    "landing.features.title": "Everything your building portfolio needs",
    "landing.pricing.title": "A setup shaped around your building portfolio",
    "landing.title": "Easy. Quick. Transparent.",
  }
  const t = (key: string) => translations[key] ?? key
  return { useTranslation: () => ({ t }) }
})

describe("LandingScreen", () => {
  beforeEach(() => {
    mockIsAuthenticated = false
  })

  it("renders the modernized MXBLOR marketing page", async () => {
    const { getByText } = await render(<LandingScreen />)

    expect(getByText("MXBLOR")).toBeTruthy()
    expect(getByText("Easy. Quick. Transparent.")).toBeTruthy()
    expect(getByText("Everything your building portfolio needs")).toBeTruthy()
    expect(
      getByText("A setup shaped around your building portfolio")
    ).toBeTruthy()
  })

  it("sends anonymous users to sign in", async () => {
    const { getByLabelText, getByText } = await render(<LandingScreen />)

    expect(getByText("Sign in to MXBLOR")).toBeTruthy()
    expect(getByLabelText("link:/login")).toBeTruthy()
  })

  it("sends authenticated users to the dashboard", async () => {
    mockIsAuthenticated = true

    const { getByLabelText, getByText } = await render(<LandingScreen />)

    expect(getByText("Open dashboard")).toBeTruthy()
    expect(getByLabelText("link:/dashboard")).toBeTruthy()
  })

  it("provides direct email, telephone and company links", async () => {
    const { getAllByLabelText, getByLabelText } = await render(
      <LandingScreen />
    )

    expect(
      getAllByLabelText("link:mailto:info@mhalloumas.com.cy")
    ).toHaveLength(2)
    expect(getByLabelText("link:tel:+35722878595")).toBeTruthy()
    expect(getByLabelText("link:https://mhalloumas.com.cy/")).toBeTruthy()
  })
})
