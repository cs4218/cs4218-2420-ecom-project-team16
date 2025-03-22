import { test, expect } from '@playwright/test';

test('Test Basic Layout', async ({ page }) => {
  await page.goto('http://localhost:3000/pagenotfound');
  await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Oops ! Page Not Found' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Go Back' })).toBeVisible();
});

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/pagenotfound');
  await expect(page.getByRole('link', { name: 'Go Back' })).toBeVisible();
  await page.getByRole('link', { name: 'Go Back' }).click();
  await expect(page.getByRole('link', { name: '🛒 Virtual Vault' })).toBeVisible();
});