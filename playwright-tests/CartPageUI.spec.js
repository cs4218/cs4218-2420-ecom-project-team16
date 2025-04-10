import { test, expect, defineConfig } from '@playwright/test';
import orderModel from '../models/orderModel';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// test.describe.configure({ retries: 3 });

test.describe("Cart Page Auth Full Cart", () => {
    test.beforeEach(async ({ page }) => {
        // navigate to page
        await page.goto('http://localhost:3000/login');

        // set localStorage for cart
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

        // login
        await page
            .getByRole("textbox", { name: "Enter Your Email" })
            .fill("admin@test.sg");
        await page.getByRole("textbox", { name: "Enter Your Password" }).click();
        await page
            .getByRole("textbox", { name: "Enter Your Password" })
            .fill("admin@test.sg");
        await page.getByRole('button', { name: 'LOGIN' }).click();

        // wait for navigation then go cart
        await page.waitForURL('http://localhost:3000/');
        await page.goto('http://localhost:3000/cart');
    });

    test.afterAll(async () => {
        await mongoose.connect(process.env.MONGO_URL);
        await orderModel.deleteMany({ buyer: "671bc2f1364eadc7d5417c80" });
        await mongoose.connection.close();
    })

    test("Should have 2 items in the cart", async ({ page }) => {
        // check pen
        await expect(page.locator('text=The Law of Contract in Singapore')).toHaveCount(1);
        await expect(page.locator(`text=A bestselling book`)).toHaveCount(1);
        await expect(page.locator('text=54.99')).toHaveCount(1);

        // check paper
        await expect(page.getByText('NUS T-shirt', { exact: true }).first()).toBeVisible();
        await expect(page.locator('text=Plain NUS T-shirt')).toHaveCount(1);
        await expect(page.locator('text=4.99').first()).toBeVisible();
    });

    test("Should say there are 2 items in the cart", async ({ page }) => {
        await expect(page.locator('text=2 items')).toHaveCount(1);
    });

    test("Should show correct cart summary", async ({ page }) => {
        const cartSummary = await page.waitForSelector('.cart-summary');
        expect(cartSummary).toBeTruthy();

        // check total price
        await expect(page.locator(`text=Total: $${(54.99+4.99).toFixed(2)}`)).toHaveCount(1);
    });

    test("Should remove item from cart", async ({ page }) => {
        // remove item
        await page.click('text=Remove');

        // check that item is removed
        await expect(page.locator('text=The Law of Contract in Singapore')).toHaveCount(0);
        await expect(page.locator('text=1 item')).toHaveCount(1);

        // remove 1 more item
        await page.click('text=Remove');

        // check that item is removed
        await expect(page.locator('text=NUS T-shirt')).toHaveCount(0);

        // check that cart is empty
        await expect(page.locator('text=Your Cart Is Empty')).toHaveCount(1);
    });

    test("Should show correct address", async ({ page }) => {
        await expect(page.locator('text=Current Address')).toHaveCount(1);
        await expect(page.locator('text=Modified test address')).toHaveCount(1);
    });

    test("Should make payment", async ({ page }) => {
        // fill in card details
        // input id is credit-card-number
        const creditCardFrame = page.frameLocator('iframe[name="braintree-hosted-field-number"]');
        const expirationFrame = page.frameLocator('iframe[name="braintree-hosted-field-expirationDate"]');
        const cvvFrame = page.frameLocator('iframe[name="braintree-hosted-field-cvv"]');

        await creditCardFrame.locator('input[name="credit-card-number"]').waitFor();
        await expirationFrame.locator('input[name="expiration"]').waitFor();
        await cvvFrame.locator('input[name="cvv"]').waitFor();

        await creditCardFrame.locator('input[name="credit-card-number"]').fill('4111111111111111');
        await expirationFrame.locator('input[name="expiration"]').fill('1225');
        await cvvFrame.locator('input[name="cvv"]').fill('420');

        // click make payment
        await page.click('text=Make Payment');

        // navigate to order page
        await page.waitForURL(/order/);

        await expect(page.locator("text=$54.99").first()).toBeVisible();
        await expect(page.locator("text=$4.99").first()).toBeVisible();
    });

    test("Should make payment for one item", async ({ page }) => {
        // remove item
        await page.click('text=Remove');

        const creditCardFrame = page.frameLocator('iframe[name="braintree-hosted-field-number"]');
        const expirationFrame = page.frameLocator('iframe[name="braintree-hosted-field-expirationDate"]');
        const cvvFrame = page.frameLocator('iframe[name="braintree-hosted-field-cvv"]');

        await creditCardFrame.locator('input[name="credit-card-number"]').waitFor();
        await expirationFrame.locator('input[name="expiration"]').waitFor();
        await cvvFrame.locator('input[name="cvv"]').waitFor();

        await creditCardFrame.locator('input[name="credit-card-number"]').fill('4111111111111111');
        await expirationFrame.locator('input[name="expiration"]').fill('1225');
        await cvvFrame.locator('input[name="cvv"]').fill('420');

        // click make payment
        await page.click('text=Make Payment');

        await page.pause();
        // navigate to order page
        await page.waitForURL(/order/);

        await expect(page.locator("text=$54.99").first()).not.toBeVisible();
        await expect(page.locator("text=$4.99").first()).toBeVisible();
    });
});