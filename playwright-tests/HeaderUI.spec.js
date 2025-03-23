import { test, expect } from '@playwright/test';

test.describe("Header UI", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000/login');
        await page.locator('input[id="exampleInputEmail1"]').fill('admin@test.sg');
        await page.locator('input[id="exampleInputPassword1"]').fill('admin@test.sg');
        await page.locator('button:has-text("LOGIN")').click();
        await page.waitForURL('http://localhost:3000/');
    });

    test("Should show correct number of cart items in header", async ({ page }) => {
        await expect(page.locator('sup:has-text("0")')).toBeVisible();

        await page.evaluate(() => {
            localStorage.setItem('cart', 
                JSON.stringify([
                    {
                        _id: "67a2171ea6d9e00ef2ac0229",
                        name: "The Law of Contract in Singapore",
                        description: "A bestselling book in Singapore",
                        price: 54.99
                    },
                    {
                        _id: "67a21772a6d9e00ef2ac022a",
                        name: "NUS T-shirt",
                        description: "Plain NUS T-shirt for sale",
                        price: 4.99
                    },
                ])
            );
        });

        await page.reload();

        await expect(page.locator('sup:has-text("2")')).toBeVisible();
    });

    test("Should logout", async ({ page }) => {
        await page.locator('a:has-text("ADMIN@TEST.SG")').click();
        await page.locator('a:has-text("LOGOUT")').click();
        await expect(page.locator('a:has-text("LOGIN")')).toBeVisible();
        const auth = await page.evaluate(() => localStorage.getItem('auth'));
        expect(auth).toBeNull();
        await expect(page.locator('a:has-text("ADMIN@TEST.SG")')).not.toBeVisible();
    });
});