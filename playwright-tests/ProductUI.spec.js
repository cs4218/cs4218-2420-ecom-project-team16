import { test, expect } from "@playwright/test";

test.describe("Products Page", () => {
  test.beforeEach(async ({ page }) => {
    // Intercept the API request and mock product data
    await page.route("/api/v1/product/get-product", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          products: [
            {
              _id: "1",
              name: "Product A",
              description: "Description of Product A",
              slug: "product-a",
            },
            {
              _id: "2",
              name: "Product B",
              description: "Description of Product B",
              slug: "product-b",
            },
          ],
        }),
      });
    });

    // Go to the Products page
    await page.goto("/dashboard/admin/products");
  });

  test("should display all products", async ({ page }) => {
    // Check if the product cards are displayed
    await expect(page.locator(".card-title")).toHaveCount(2);
    await expect(page.locator(".card-title").nth(0)).toHaveText("Product A");
    await expect(page.locator(".card-title").nth(1)).toHaveText("Product B");
  });

  test('should display product image correctly', async ({ page }) => {
    const productImage = page.locator('img[alt="Product A"]');
    await expect(productImage).toHaveAttribute('src', '/api/v1/product/product-photo/1');
  });

  test("should navigate to product details page when a product is clicked", async ({ page }) => {
    // Click on "Product A"
    await page.locator(".product-link").nth(0).click();
    // Expect navigation to happen
    await expect(page).toHaveURL(/.*dashboard\/admin\/product\/product-a/);
  });

});

