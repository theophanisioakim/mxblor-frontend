import { expect, test } from "@playwright/test"

test("starts the Next app and renders the shared landing screen", async ({
  page,
}) => {
  await page.goto("/")

  // The landing title has a second non-accessible DOM copy during hydration,
  // so assert the unique, user-facing call to action instead.
  const loginLink = page.getByRole("link", { name: "Sign in to MXBLOR" })
  await expect(loginLink).toBeVisible()
  await expect(loginLink).toHaveAttribute("href", "/login")
})
