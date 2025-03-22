import { test, expect } from "@playwright/test";
import slugify from "slugify";

test.describe("Test correct rendering of page content", () => {
  test("correct rendering for book category", async ({ page }) => {
    await page.goto("http://localhost:3000/category/book");
    await expect(
      page.getByRole("heading", { name: "Category - Book" })
    ).toBeVisible();
    await expect(page.getByRole("main")).toContainText("Category - Book");
    await expect(
      page.getByRole("heading", { name: "result found" })
    ).toBeVisible();
    await expect(page.locator("h6")).toContainText("3 result found");
    await expect(page.getByText("Textbook$79.99A comprehensive")).toBeVisible();
    await expect(page.getByText("Novel$14.99A bestselling")).toBeVisible();
    await expect(
      page.getByText(
        "The Law of Contract in Singapore$54.99A bestselling book in Singapore...More"
      )
    ).toBeVisible();
  });
  test("correct rendering for non existent category", async ({ page }) => {
    await page.goto("http://localhost:3000/category/nil");
    await expect(page.getByRole("main")).toContainText("Category -");
    await expect(page.locator("h6")).toContainText("0 result found");
  });
});

test.describe("Test correct navigation of page elements", () => {
  test("Check product names and navigate via 'More Details' button", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000/category/book");

    // Wait for products to load
    await page.waitForSelector(".card");

    const productNames = await page.locator(".card-title").allTextContents();
    // console.log("Product Names:", productNames);

    // Ensure at least one product is present
    expect(productNames.length).toBeGreaterThan(0);

    const productCard = page.locator(`.card:has-text("${productNames[0]}")`);
    const navigatePromise = page.waitForURL(
      `**/product/${slugify(productNames[0], { lower: true, strict: true })}`
    );
    await productCard.locator('button:has-text("More Details")').click();
    await navigatePromise;

    expect(page.url()).toContain(
      `/product/${slugify(productNames[0], { lower: true, strict: true })}`
    );
  });
});
