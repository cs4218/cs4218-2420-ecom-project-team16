import { test, expect } from "@playwright/test";

test.describe("LayoutUI", () => {
  test("Should display the layout", async ({ page }) => {
    await page.goto("http://localhost:3000/policy");
    await expect(page.title()).resolves.toMatch("Privacy Policy");
    await expect(page.locator("text=Not allowed for replication")).toBeVisible();
  });
});