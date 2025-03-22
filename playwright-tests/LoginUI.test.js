import { test, expect } from '@playwright/test';

test('Test Basic Layout', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await expect(page.getByRole('heading', { name: 'LOGIN FORM' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Enter Your Email' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Enter Your Password' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Forgot Password' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'LOGIN' })).toBeVisible();
});

test('Unable to login with empty fields', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await expect(page.getByRole('textbox', { name: 'Enter Your Email' })).toBeEmpty();
    await expect(page.getByRole('textbox', { name: 'Enter Your Password' })).toBeEmpty();
    await page.getByRole('button', { name: 'LOGIN' }).click();
});

test('Unable to login with incorrect user', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('test@gmail.com');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('haha');
    await page.getByRole('button', { name: 'LOGIN' }).click();
    await expect(page.getByText('Something went wrong')).toBeVisible();
});

// Note that this test case requires the loaded data from canvas
test("Successful Login", async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('cs4218@test.com');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('cs4218@test.com');
    await page.getByRole('button', { name: 'LOGIN' }).click();
    await expect(page.getByRole('button', { name: 'CS 4218 Test Account' })).toBeVisible();
});

// Note that there are no tests for forgot password as page does not exist
