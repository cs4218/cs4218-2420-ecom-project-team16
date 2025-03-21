import { test, expect } from '@playwright/test';

test.describe("Cart Page Auth Full Cart", () => {
    test.beforeEach(async ({ page }) => {
        // navigate to page
        await page.goto('http://localhost:3000/login');

        // set localStorage for cart
        await page.evaluate(() => {
            localStorage.setItem('cart', 
                JSON.stringify([
                    { _id: "000000000000000000000001", name: 'Pen', description: 'To write with', price: 1.5 },
                    { _id: "000000000000000000000002", name: 'Paper', description: 'To write on', price: 4.2 },
                    { _id: "000000000000000000000003", name: 'Apple', description: 'To eat', price: 0.97 },
                ])
            );
        });

        // login
        await page.locator('input[id="exampleInputEmail1"]').fill('hongshan@gmail.com');
        await page.locator('input[id="exampleInputPassword1"]').fill('hongshan');
        await page.getByRole('button', { name: 'LOGIN' }).click();

        // wait for navigation then go cart
        await page.waitForURL('http://localhost:3000/');
        await page.goto('http://localhost:3000/cart');
    });

    test("Should have 3 items in the cart", async ({ page }) => {
        // check pen
        await expect(page.locator('text=Pen')).toHaveCount(1);
        await expect(page.locator('text=To write with')).toHaveCount(1);
        await expect(page.locator('text=1.5')).toHaveCount(1);

        // check paper
        await expect(page.locator('text=Paper')).toHaveCount(1);
        await expect(page.locator('text=To write on')).toHaveCount(1);
        await expect(page.locator('text=4.2')).toHaveCount(1);

        // check apple
        await expect(page.locator('text=Apple')).toHaveCount(1);
        await expect(page.locator('text=To eat')).toHaveCount(1);
        await expect(page.locator('text=0.97')).toHaveCount(1);
    });

    test("Should say there are 3 items in the cart", async ({ page }) => {
        await expect(page.locator('text=3 items')).toHaveCount(1);
    });

    test("Should show correct cart summary", async ({ page }) => {
        const cartSummary = await page.waitForSelector('.cart-summary');
        expect(cartSummary).toBeTruthy();

        // check total price
        await expect(page.locator('text=Total : $6.67')).toHaveCount(1);
    });

    test("Should remove item from cart", async ({ page }) => {
        // remove item
        await page.click('text=Remove');

        // check that item is removed
        await expect(page.locator('text=Pen')).toHaveCount(0);

        // remove 2 more items
        await page.click('text=Remove');
        await page.click('text=Remove');

        // check that cart is empty
        await expect(page.locator('text=Your Cart Is Empty')).toHaveCount(1);
    });

    test("Should show correct address", async ({ page }) => {
        await expect(page.locator('text=Current Address')).toHaveCount(1);
        await expect(page.locator('text=Redhill')).toHaveCount(1);
    });

    test("Should make payment", async ({ page }) => {
        // fill in card details
        // input id is credit-card-number
        const creditCardFrame = page.frameLocator('iframe[name="braintree-hosted-field-number"]');
        const expirationFrame = page.frameLocator('iframe[name="braintree-hosted-field-expirationDate"]');
        const cvvFrame = page.frameLocator('iframe[name="braintree-hosted-field-cvv"]');

        await creditCardFrame.locator('input[name="credit-card-number"]').fill('4111111111111111');
        await expirationFrame.locator('input[name="expiration"]').fill('1225');
        await cvvFrame.locator('input[name="cvv"]').fill('420');

        // click make payment
        await page.click('text=Make Payment');

        // check for navigation to orders page
        await page.waitForURL(/\/orders/);
        await expect(page.locator('text=All Orders')).toHaveCount(1);

        await expect(page.locator('text=Hong Shan')).toBeVisible();
        await expect(page.locator('text=Success')).toBeVisible();
    });
});