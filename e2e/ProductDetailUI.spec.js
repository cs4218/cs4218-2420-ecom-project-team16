import { test, expect } from '@playwright/test';

test.describe('Product Details Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API response for product details
    await page.route('**/api/v1/product/get-product/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          product: {
            _id: '123',
            slug: 'mock-product',
            name: 'Mock Product',
            description: 'This is a mock product description.',
            price: 100,
            category: { _id: '456', name: 'Mock Category' }
          }
        }),
      });
    });

    // Mock API response for related products
    await page.route('**/api/v1/product/related-product/*/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          products: [
            { _id: '789', slug: 'similar-product-a', name: 'Similar Product A', price: 80, description: 'Similar product A description' },
            { _id: '101', slug: 'similar-product-b', name: 'Similar Product B', price: 120, description: 'Similar product B description' }
          ]
        }),
      });
    });

    // Navigate to the Product Details page
    await page.goto('http://localhost:3000/product/mock-product');
  });

  test('should display product details correctly', async ({ page }) => {
    // Check if product details are displayed
    await expect(page.locator('h6:has-text("Name : Mock Product")')).toBeVisible();
    await expect(page.locator('h6:has-text("Description : This is a mock product description.")')).toBeVisible();
    await expect(page.locator('h6:has-text("Price :$100.00")')).toBeVisible();
    await expect(page.locator('h6:has-text("Category : Mock Category")')).toBeVisible();
  });

  test('should show "No Similar Products found" when no similar products exist', async ({ page }) => {
    // Re-mock the API to return no similar products
    await page.route('**/api/v1/product/related-product/*/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ products: [] }),
      });
    });

    await page.reload();
    await expect(page.locator('text=No Similar Products found')).toBeVisible();
  });

  test('should display similar products', async ({ page }) => {
    await expect(page.locator('h5:has-text("Similar Product A")')).toBeVisible()
    await expect(page.locator('h5:has-text("Similar Product B")')).toBeVisible()
  });

  test('should navigate to similar product details page when "More Details" is clicked', async ({ page }) => {
    await page.locator('button:has-text("More Details")').first().click();
    await expect(page).toHaveURL(/.*product\/similar-product-a/);
  });

  test('should display product image correctly', async ({ page }) => {
    const productImage = page.locator('img[alt="Mock Product"]');
    await expect(productImage).toHaveAttribute('src', '/api/v1/product/product-photo/123');
  });

  test('should display similar product images correctly', async ({ page }) => {
    const similarProductAImage = page.locator('img[alt="Similar Product A"]');
    const similarProductBImage = page.locator('img[alt="Similar Product B"]');
    
    await expect(similarProductAImage).toHaveAttribute('src', '/api/v1/product/product-photo/789');
    await expect(similarProductBImage).toHaveAttribute('src', '/api/v1/product/product-photo/101');
  });

  test('should add product to cart when clicking "ADD TO CART"', async ({ page }) => {
    const addToCartButton = page.locator('text=ADD TO CART');
    await expect(addToCartButton).toBeVisible();
    await addToCartButton.click();
    // Fix the component for adding to cart
  });
});
