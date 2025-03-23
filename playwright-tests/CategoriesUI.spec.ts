import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000/categories");
});

test.describe("ensure correct rendering of page contents", () => {
  test("Layouts rendered and categories displayed", async ({ page }) => {
    await expect(
      page.getByText("🛒 Virtual VaultSearchHomeCategoriesAll")
    ).toBeVisible();
    await expect(page.locator("#navbarTogglerDemo01")).toContainText(
      "🛒 Virtual Vault"
    );
    await expect(page.getByRole("button", { name: "Search" })).toBeVisible();
    await expect(page.getByRole("list")).toContainText("Home");
    await expect(page.getByRole("list")).toContainText("Categories");
    await expect(page.getByRole("list")).toContainText("Register");
    await page.getByRole("link", { name: "Categories" }).click();
    await expect(
      page.getByRole("link", { name: "All Categories" })
    ).toBeVisible();
    await expect(
      page
        .locator("#navbarTogglerDemo01")
        .getByRole("link", { name: "Electronics" })
    ).toBeVisible();
    await expect(
      page.locator("#navbarTogglerDemo01").getByRole("link", { name: "Book" })
    ).toBeVisible();
    await expect(
      page
        .locator("#navbarTogglerDemo01")
        .getByRole("link", { name: "Clothing" })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
    await expect(
      page.locator("div").filter({ hasText: "🛒 Virtual" }).nth(2)
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Cart" })).toBeVisible();
    await expect(
      page.getByRole("main").getByRole("link", { name: "Electronics" })
    ).toBeVisible();
    await expect(
      page.getByRole("main").getByRole("link", { name: "Book" })
    ).toBeVisible();
    await expect(
      page.getByRole("main").getByRole("link", { name: "Clothing" })
    ).toBeVisible();
  });

  test("clicking on category link navigates to correct page", async ({
    page,
  }) => {
    const navigateToCategory = page.waitForURL("**/category/electronics");
    await page.getByRole("link", { name: "Electronics" }).click();
    await navigateToCategory;
    expect(page.url()).toContain("/category/electronics");
  });
});
