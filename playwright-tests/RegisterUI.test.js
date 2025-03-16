import { test, expect } from '@playwright/test';

test('Test Basic Layout', async ({ page }) => {
    await page.goto('http://localhost:3000/register');
    await expect(page.getByRole('heading', { name: 'REGISTER FORM' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Enter Your Name' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Enter Your Password' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Enter Your Password' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Enter Your Phone' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Enter Your Address' })).toBeVisible();
    await expect(page.getByPlaceholder('Enter Your DOB')).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'What is Your Favorite sports' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'REGISTER' })).toBeVisible();
});

// Can only be used on a database without this user
// test('Successful Registration', async ({ page }) => {
//     await page.goto('http://localhost:3000/register');
//     await page.getByRole('textbox', { name: 'Enter Your Name' }).click();
//     await page.getByRole('textbox', { name: 'Enter Your Name' }).fill('TestTest123');
//     await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
//     await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('believe@gmail.com');
//     await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
//     await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('Qwerty');
//     await page.getByRole('textbox', { name: 'Enter Your Phone' }).click();
//     await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill('88888888');
//     await page.getByRole('textbox', { name: 'Enter Your Address' }).click();
//     await page.getByRole('textbox', { name: 'Enter Your Address' }).fill('123 Football Street');
//     await page.getByPlaceholder('Enter Your DOB').fill('2025-03-20');
//     await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).click();
//     await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).fill('Badminton');
//     await page.getByRole('button', { name: 'REGISTER' }).click();
//     await expect(page.getByRole('heading', { name: 'LOGIN FORM' })).toBeVisible();
// });

test("Unable to register with empty form", async ({ page }) => {
    await page.goto('http://localhost:3000/register');
    await expect(page.getByRole('textbox', { name: 'Enter Your Name' })).toBeEmpty();
    await expect(page.getByRole('textbox', { name: 'Enter Your Email' })).toBeEmpty();
    await expect(page.getByRole('textbox', { name: 'Enter Your Password' })).toBeEmpty();
    await expect(page.getByRole('textbox', { name: 'Enter Your Phone' })).toBeEmpty();
    await expect(page.getByRole('textbox', { name: 'Enter Your Address' })).toBeEmpty();
    await expect(page.getByPlaceholder('Enter Your DOB')).toBeEmpty();
    await expect(page.getByRole('textbox', { name: 'What is Your Favorite sports' })).toBeEmpty();
    await page.getByRole('button', { name: 'REGISTER' }).click();
    await expect(page.getByRole('heading', { name: 'REGISTER FORM' })).toBeVisible();
});
