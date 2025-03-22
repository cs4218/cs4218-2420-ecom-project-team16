import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000/search");
});

test.describe("No results found", () => {
  test("when page first loaded", async ({ page }) => {
    await page.goto("http://localhost:3000/search");
    await expect(
      page.getByText("🛒 Virtual VaultSearchHomeCategoriesAll")
    ).toBeVisible();
    await expect(page.getByRole("list")).toContainText("Home");
    await expect(page.getByRole("link", { name: "Categories" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Register" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Cart" })).toBeVisible();
    await expect(page.getByRole("searchbox", { name: "Search" })).toBeVisible();
    await expect(page.locator("h6")).toContainText("No Products Found");
    await expect(page.locator("h1")).toContainText("Search Results");
  });

  test("when search yields no results", async ({ page }) => {
    await page.goto("http://localhost:3000/search");
    await page.getByRole("searchbox", { name: "Search" }).click();
    await page
      .getByRole("searchbox", { name: "Search" })
      .fill("Non existent product here");
    await page.getByRole("button", { name: "Search" }).click();
    await expect(page.locator("h1")).toContainText("Search Results");
    await expect(page.locator("h6")).toContainText("No Products Found");
  });
});
test.describe("Result found with correct contents shown", () => {
  test("test Search page UI with single search result", async ({ page }) => {
    await page.getByRole("searchbox", { name: "Search" }).click();
    await page.getByRole("searchbox", { name: "Search" }).fill("novel");
    await page.getByRole("button", { name: "Search" }).click();
    await expect(page.locator("h1")).toContainText("Search Results");
    await expect(page.getByRole("heading", { name: "Found" })).toBeVisible();
    await expect(page.locator("h5")).toContainText("Novel");
    await expect(page.getByText("NovelA bestselling novel")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "More Details" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "ADD TO CART" })
    ).toBeVisible();
  });
  test("test Search page UI with multiple search result", async ({ page }) => {
    await page.getByRole("searchbox", { name: "Search" }).click();
    await page.getByRole("searchbox", { name: "Search" }).fill("bestselling");
    await page.getByRole("button", { name: "Search" }).click();
    await expect(
      page.getByRole("heading", { name: "Search Results" })
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Found" })).toBeVisible();
    await expect(page.locator("h6")).toContainText("Found 2");
    await expect(
      page.getByText(
        "The Law of Contract in SingaporeA bestselling book in Singapor... $ 54.99More"
      )
    ).toBeVisible();
    await expect(page.getByText("NovelA bestselling novel")).toBeVisible();
  });
});
