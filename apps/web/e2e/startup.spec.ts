import { expect, test } from "@playwright/test"

test("starts the Next app and renders the shared home screen", async ({
  page,
}) => {
  await page.goto("/")

  await expect(page.getByText("Project ready!")).toBeVisible()
  await expect(
    page.getByText("One screen, shared by the web and native apps.")
  ).toBeVisible()
  await expect(page.getByRole("button", { name: "Button" })).toBeVisible()
})
