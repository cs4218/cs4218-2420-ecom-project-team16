import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/dashboard/admin/products');
});

test('has title', async ({ page }) => {
  await expect(page.getByText('All Products List')).toBeVisible();
})

test('product card should be visible', async ({ page }) => {
  const card = page.locator('.card')
  await expect(card.first()).toBeVisible()
})

test('product title should be visible', async ({ page }) => {
  await expect(page.locator('h5.card-title').first()).toBeVisible();
})

test('product description should be visible', async ({ page }) => {
  await expect(page.locator('h5.card-text').first()).toBeVisible();
})

test('product should be clickable', async ({ page }) => {
  await page.locator('.card').first().click();
  await expect(page.getByRole('heading', { name: 'Update Product' })).toBeVisible();
});

test('product clicked on should match the one redirected to', async ({ page }) => {
  const card = page.locator('.card').first();
  const expectedTitle = await card.locator('h5.card-title').textContent();

  await card.click()
  await expect(page.getByRole('textbox', { name: 'write a name' })).toHaveValue(expectedTitle)
})
