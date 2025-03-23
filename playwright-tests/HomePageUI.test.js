import { test, expect } from '@playwright/test';

test('Test Basic Layout', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await expect(page.getByRole('link', { name: '🛒 Virtual Vault' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'All Products' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Filter By Category' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Filter By Price' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
});

test('Test Filter By Category', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('checkbox', { name: 'Book' }).check();
  await expect(page.getByRole('img', { name: 'NUS T-shirt' })).toBeVisible();
  await page.getByRole('checkbox', { name: 'Book' }).check();
  await expect(page.getByRole('img', { name: 'NUS T-shirt' })).not.toBeVisible();
  await page.getByRole('checkbox', { name: 'Book' }).uncheck();
  await expect(page.getByRole('img', { name: 'NUS T-shirt' })).toBeVisible();
});

test('Test Filter By Price', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await expect(page.getByRole('heading', { name: 'The Law of Contract in' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '$54.99' })).toBeVisible();
  await page.getByRole('radio', { name: '$0 to' }).check();
  await expect(page.getByRole('heading', { name: '$54.99' })).not.toBeVisible();
  await expect(page.getByRole('heading', { name: 'The Law of Contract in' })).not.toBeVisible();
  await page.getByRole('button', { name: 'RESET FILTERS' }).click();
  await expect(page.getByRole('heading', { name: '$54.99' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'The Law of Contract in' })).toBeVisible();
});

test('Test Click Login has redirect', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Login' }).click();
  await expect(page.getByRole('heading', { name: 'LOGIN FORM' })).toBeVisible();
});

test('Test Click Register has redirect', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Register' }).click();
  await expect(page.getByRole('heading', { name: 'REGISTER FORM' })).toBeVisible();
});

test('Add to cart successfully', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await expect(page.getByText('0', { exact: true })).toBeVisible();
  await expect(page.getByText('Novel$')).toBeVisible();
  await expect(page.locator('div:nth-child(2) > .card-body > div:nth-child(3) > button:nth-child(2)')).toBeVisible();
  await page.locator('div:nth-child(2) > .card-body > div:nth-child(3) > button:nth-child(2)').click();
  await expect(page.getByTitle('1')).toBeVisible();
}, 10000);

test('Redirect to More Details Page of Product', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await expect(page.getByRole('heading', { name: 'Novel' })).toBeVisible();
  await expect(page.locator('div:nth-child(2) > .card-body > div:nth-child(3) > button').first()).toBeVisible();
  await page.locator('div:nth-child(2) > .card-body > div:nth-child(3) > button').first().click();
  await new Promise((resolve) => setTimeout(resolve, 3000));
  await expect(page.getByRole('heading', { name: 'Product Details' })).toBeVisible();
}, 10000);