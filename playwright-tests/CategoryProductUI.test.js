import { test, expect } from '@playwright/test';

/**
 * Note that this entire test file requires the loading of the default database
 */

test('Test Basic Layout with pre-input data', async ({ page }) => {
    await page.goto('http://localhost:3000/category/clothing');
    await expect(page.getByRole('heading', { name: 'Category - Clothing' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'result found' })).toBeVisible({ timeout: 10000 });
}, 10000);

test('Test Redirection to product page', async ({ page }) => {
    await page.goto('http://localhost:3000/category/clothing');
    await expect(page.getByRole('heading', { name: 'NUS T-shirt' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Plain NUS T-shirt for sale...')).toBeVisible();
    await expect(page.getByRole('button', { name: 'More Details' })).toBeVisible();
    await page.getByRole('button', { name: 'More Details' }).click();
    await expect(page.getByRole('heading', { name: 'Product Details' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Name : NUS T-shirt' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Description : Plain NUS T-' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Category : Clothing' })).toBeVisible();
}, 10000);