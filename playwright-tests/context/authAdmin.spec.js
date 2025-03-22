import { test } from '@playwright/test';

test('authentication admin and save state', async ({ page }) => {
    await page.goto('/login');

    await page
        .getByPlaceholder('Enter Your Email ')
        .fill('admin@test.sg')
    await page
        .getByPlaceholder('Enter Your Password')
        .fill('admin@test.sg')

    await page.getByRole('button', { name: 'LOGIN' }).click();

    await page.waitForURL('/')

    // Save authentication state for reuse
    await page.context().storageState({ path: 'e2e/context/adminAuth.json' });
})
