import { test, expect } from '@playwright/test';

test.describe('Update Product Page', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept the API request for getting mock product data
    await page.route('**/api/v1/product/get-product/*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            product: {
              _id: '123',
              slug: 'mock-product',
              name: 'Mock Product',
              quantity: 50,
              description: 'This is a mock product description.',
              price: 100,
              category: { _id: '456', name: 'Mock Category', slug: 'mock category' },
              shipping: "yes",
            }
          }),
        });
    });

    // Intercept the API request for updating product
    await page.route('**/api/v1/product/update-product/*', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
                success: true,
                message: "Product Updated Successfully"
            })
        })
    })

    // Intercept the API request for deleting product
    await page.route('**/api/v1/product/delete-product/*', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
                success: true,
                message: "Product deleted successfully"
            })
        })
    })
  
    await page.goto('/dashboard/admin/product/mock-product');
  });

  test('should load the product details correctly', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Update Product');
    await expect(page.locator('.ant-select-selection-item').first()).toHaveText('Mock Category');
    await expect(page.locator('input[placeholder="write a name"]')).toHaveValue('Mock Product');
    await expect(page.locator('textarea[placeholder="write a description"]')).toHaveValue('This is a mock product description.');
    await expect(page.locator('input[placeholder="write a Price"]')).toHaveValue('100');
    await expect(page.locator('input[placeholder="write a quantity"]')).toHaveValue('50');
    await expect(page.locator('.ant-select-selection-item').nth(1)).toHaveText('yes');
  });

  test('should display product image correctly', async ({ page }) => {
    const productImage = page.locator('img[alt="product_photo"]');
    await expect(productImage).toHaveAttribute('src', '/api/v1/product/product-photo/123');
  });

  test('should update the product successfully', async ({ page }) => {
    await page.fill('input[placeholder="write a name"]', 'Updated Product Name');
    await page.fill('textarea[placeholder="write a description"]', 'Updated description');
    await page.fill('input[placeholder="write a Price"]', '50');
    await page.fill('input[placeholder="write a quantity"]', '10');

    await page.click('button:has-text("UPDATE PRODUCT")');

    await page.waitForTimeout(100);
    await expect(page.getByText("Product Updated Successfully")).toBeVisible();
    await expect(page).toHaveURL("/dashboard/admin/products");
  });

  test('should upload images successfully', async ({ page }) => {
    // test more extensively
    await expect(page.getByText('Upload Photo')).toBeVisible();
  })

  test('should update the product unsuccessfully', async ({ page }) => {
    // Override previous API interception for falsy condition
    await page.route('**/api/v1/product/update-product/*', async (route) => {
        await route.fulfill({
            status: 500,
            contentType: "application/json",
            body: JSON.stringify({
                success: false,
                message: "something went wrong"
            })
        })
    })

    await page.fill('input[placeholder="write a name"]', 'Updated Product Name');
    await page.fill('textarea[placeholder="write a description"]', 'Updated description');
    await page.fill('input[placeholder="write a Price"]', '50');
    await page.fill('input[placeholder="write a quantity"]', '10');

    await page.click('button:has-text("UPDATE PRODUCT")');

    await page.waitForTimeout(100);
    await expect(page.getByText("something went wrong")).toBeVisible();
  });

  test('should delete the product successfully', async ({ page }) => {
    page.once('dialog', async (dialog) => {
        expect(dialog.message()).toBe('Are You Sure want to delete this product ? ')
        await dialog.accept('yes');
    });

    await page.click('button:has-text("DELETE PRODUCT")');

    await expect(page.getByText("Product deleted successfully")).toBeVisible();
    await expect(page).toHaveURL("/dashboard/admin/products");
  });

  test('should delete the product unsuccessfully', async ({ page }) => {
    // Override previous API interception for falsy condition
    await page.route('**/api/v1/product/delete-product/*', async (route) => {
        await route.fulfill({
            status: 500,
            contentType: "application/json",
            body: JSON.stringify({
                success: false,
                message: "Something went wrong"
            })
        })
    })

    page.once('dialog', async (dialog) => {
        expect(dialog.message()).toBe('Are You Sure want to delete this product ? ')
        await dialog.accept('yes');
    });

    await page.click('button:has-text("DELETE PRODUCT")');

    await expect(page.getByText("Something went wrong")).toBeVisible();
  });

  test('should not delete the product if cancelled', async ({ page }) => {
    page.once('dialog', async (dialog) => {
        expect(dialog.message()).toBe('Are You Sure want to delete this product ? ')
        await dialog.dismiss();
    });

    await page.click('button:has-text("DELETE PRODUCT")');
  });
});
