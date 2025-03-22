import { test, expect } from '@playwright/test';

test.describe("User Menu UI", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000/login');
        await page.locator('input[id="exampleInputEmail1"]').fill('hongshan@gmail.com');
        await page.locator('input[id="exampleInputPassword1"]').fill('hongshan');
        await page.getByRole('button', { name: 'LOGIN' }).click();

        await page.waitForURL('http://localhost:3000/');
        await page.goto('http://localhost:3000/dashboard/user');
    });

    test("Should show user menu", async ({ page }) => {
        await expect(page.locator('text=Orders')).toBeVisible();
        await expect(page.locator('text=Profile')).toBeVisible();
    });

    test("Should lead to orders dashboard", async ({ page }) => {
        await page.locator('text=Orders').click();
        await expect(page.locator('text=All Orders')).toBeVisible();
        await expect(page.locator('text=Profile').first()).toBeVisible();
    });

    test("Should lead to profile dashboard", async ({ page }) => {
        await page.locator('text=Profile').click();
        await expect(page.locator('text=USER PROFILE')).toBeVisible();
        await expect(page.locator('text=Orders').first()).toBeVisible();
        await expect(page.locator('text=Profile').first()).toBeVisible();
    });
});