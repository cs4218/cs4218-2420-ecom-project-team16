import { test, expect } from '@playwright/test';

test.describe("Auth Integration", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000/');
        await page.evaluate(() => {
            localStorage.removeItem('auth');
        });
    });

    test("Should login and see relevant details in localStorage", async ({ page }) => {
        await page.goto('http://localhost:3000/login');
        await page.locator('input[id="exampleInputEmail1"]').fill('admin@test.sg');
        await page.locator('input[id="exampleInputPassword1"]').fill('admin@test.sg');
        await page.getByRole('button', { name: 'LOGIN' }).click();

        await page.waitForURL('http://localhost:3000/');
        const auth = await page.evaluate(() => {
            return JSON.parse(localStorage.getItem('auth'));
        });
        expect(auth.user.name).toBe('admin@test.sg');
        expect(auth.token).toBeTruthy();
        expect(auth.user.email).toBe('admin@test.sg');
    });

    test("Should redirect to login page if not logged in, with spinner", async ({ page }) => {
        await page.goto('http://localhost:3000/dashboard/user');
        await page.waitForSelector('.spinner-border');
        await expect(page.locator('text=Redirecting you in 3 seconds')).toBeVisible();
        await expect(page.locator('text=Redirecting you in 2 seconds')).toBeVisible();
        await expect(page.locator('text=Redirecting you in 1 second')).toBeVisible();
        await page.waitForURL('http://localhost:3000/');
    })

    test("Should show Register and Login links when not logged in", async ({ page }) => {
        await page.goto('http://localhost:3000/login');
        await expect(page.locator('a:has-text("Register")')).toBeVisible();
        await expect(page.locator('a:has-text("Login")')).toBeVisible();
        await expect(page.locator('a:has-text("Dashboard")')).not.toBeVisible();
        await expect(page.locator('a:has-text("Logout")')).not.toBeVisible();
    });

    test("Should show name, dashboard, and logout links when logged in", async ({ page }) => {
        await page.goto('http://localhost:3000/login');
        await page.locator('input[id="exampleInputEmail1"]').fill('admin@test.sg');
        await page.locator('input[id="exampleInputPassword1"]').fill('admin@test.sg');
        await page.getByRole('button', { name: 'LOGIN' }).click();

        await page.waitForURL('http://localhost:3000/');
        await expect(page.locator('a:has-text("admin@test.sg")')).toBeVisible();
        await page.locator('a:has-text("admin@test.sg")').click();
        await expect(page.locator('a:has-text("Dashboard")')).toBeVisible();
        await expect(page.locator('a:has-text("Logout")')).toBeVisible();
        await expect(page.locator('a:has-text("Register")')).not.toBeVisible();
        await expect(page.locator('a:has-text("Login")')).not.toBeVisible();
    });

    test("Should show correct user details in dashboard", async ({ page }) => {
        await page.goto('http://localhost:3000/login');
        await page.locator('input[id="exampleInputEmail1"]').fill('cs4218@test.com');
        await page.locator('input[id="exampleInputPassword1"]').fill('cs4218@test.com');
        await page.getByRole('button', { name: 'LOGIN' }).click();

        await page.waitForURL('http://localhost:3000/');
        await page.locator('a:has-text("CS 4218 TEST ACCOUNT")').click();
        await page.locator('a:has-text("Dashboard")').click();
        
        await page.waitForURL('http://localhost:3000/dashboard/user');
        await expect(page.locator('text=cs4218@test.com')).toBeVisible();
        await expect(page.locator('text=1 Computing Drive')).toBeVisible();
    });
})