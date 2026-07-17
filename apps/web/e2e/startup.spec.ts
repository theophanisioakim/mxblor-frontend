import { expect, test } from "@playwright/test"

test("starts the Next app and renders the shared landing screen", async ({
  page,
}) => {
  await page.goto("/")

  // Copy comes from the `landing.*` keys in
  // packages/i18n/src/locales/en/screens.json — update both together.
  await expect(
    page.getByText("Easy. Quick. Transparent.", { exact: true })
  ).toBeVisible()
  const loginLink = page.getByRole("link", { name: "Sign in to MXBLOR" })
  await expect(loginLink).toBeVisible()
  await expect(loginLink).toHaveAttribute("href", "/login")
})
