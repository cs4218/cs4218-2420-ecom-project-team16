import { test, expect } from "@playwright/test";
import JWT from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const fakeUser = {
  _id: "faker",
  name: "Faker",
  email: "faker@example.com",
  address: "fake address",
};
const fakeStorageItem = {
  success: true,
  user: fakeUser,
  token: JWT.sign({ _id: fakeUser._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  }),
};

test("Dashboard displays user information correctly", async ({ page }) => {
  await page.addInitScript((data) => {
    localStorage.setItem("auth", JSON.stringify(data));
  }, fakeStorageItem);

  await page.goto("http://localhost:3000/dashboard/user");

  await expect(page.locator("h3")).toHaveText([
    fakeUser.name,
    fakeUser.email,
    fakeUser.address,
  ]);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Profile" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Orders" })).toBeVisible();
});
