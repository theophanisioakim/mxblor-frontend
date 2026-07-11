import { expect, test } from "@playwright/test"

test("starts the Next app and renders the shared home screen", async ({
  page,
}) => {
  await page.goto("/")

  // Copy comes from the `home.*` keys in
  // packages/i18n/src/locales/en/screens.json — update both together.
  await expect(page.getByText("Project ready!")).toBeVisible()
  await expect(
    page.getByText("One screen, shared by the web and native apps.")
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Example button" })
  ).toBeVisible()
})
