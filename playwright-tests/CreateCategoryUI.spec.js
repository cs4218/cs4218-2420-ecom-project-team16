import { test, expect } from "@playwright/test";
import mongoose from "mongoose";
import dotenv from "dotenv";
import categoryModel from "../models/categoryModel";

dotenv.config();

test.describe("test non authorised users acess to createCategory Page", () => {
  test("Non logged in user redirected", async ({ page }) => {
    await page.goto("http://localhost:3000/dashboard/admin/create-category");
    const redirection = page.waitForURL("**/login");
    await expect(
      page.getByText("Redirecting you in 2 secondsLoading...")
    ).toBeVisible();
    await redirection;
    expect(page.url()).toContain("/login");
  });
});

test.describe("login with admin user and access page", () => {
  //Log in for each test
  test.setTimeout(60000);
  // test.beforeEach(async ({ page }) => {
  //   await page.goto("http://localhost:3000/login");

  //   await page
  //     .getByRole("textbox", { name: "Enter Your Email" })
  //     .fill("admin@test.sg");
  //   await page.getByRole("textbox", { name: "Enter Your Password" }).click();
  //   await page
  //     .getByRole("textbox", { name: "Enter Your Password" })
  //     .fill("admin@test.sg");
  //   await page.getByRole("button", { name: "LOGIN" }).click();
  //   const loggedIn = page.waitForURL("http://localhost:3000");
  //   await new Promise((resolve) => setTimeout(resolve, 5000));
  //   await loggedIn;
  // });

  test("To create a new category", async ({ page }) => {
    await mongoose.connect(process.env.MONGO_URL);
    await page.goto("http://localhost:3000/login");

    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill("admin@test.sg");
    await page.getByRole("textbox", { name: "Enter Your Password" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill("admin@test.sg");
    await page.getByRole("button", { name: "LOGIN" }).click();
    await page.waitForURL("http://localhost:3000");

    await page.goto("http://localhost:3000/dashboard/admin/create-category");
    await page.getByRole("textbox", { name: "Enter new category" }).click();
    await page
      .getByRole("textbox", { name: "Enter new category" })
      .fill("Mock category");
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(
      page.getByRole("cell", { name: "Mock category" })
    ).toBeVisible();
    await categoryModel.deleteOne({ name: "Mock category" });
  });

  test("To update an existing category", async ({ page }) => {
    await mongoose.connect(process.env.MONGO_URL);
    await categoryModel.create({
      name: "Category to update",
      slug: "category to update",
    });
    await page.goto("http://localhost:3000/login");

    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill("admin@test.sg");
    await page.getByRole("textbox", { name: "Enter Your Password" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill("admin@test.sg");
    await page.getByRole("button", { name: "LOGIN" }).click();
    await page.waitForURL("http://localhost:3000");
    await page.goto("http://localhost:3000/dashboard/admin/create-category");
    await expect(
      page.getByRole("cell", { name: "Category to update" })
    ).toBeVisible();
    await page
      .getByRole("row", { name: "Category to update Edit Delete" })
      .getByRole("button")
      .first()
      .click();
    await page
      .getByRole("dialog")
      .getByRole("textbox", { name: "Enter new category" })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("textbox", { name: "Enter new category" })
      .fill("Updated category");
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Submit" })
      .click();
    await expect(
      page.getByRole("cell", { name: "Updated category" })
    ).toBeVisible();
    await categoryModel.deleteOne({ name: "Category to update" });
    await categoryModel.deleteOne({ name: "Updated category" });
  });

  test("to delete a category", async ({ page }) => {
    await mongoose.connect(process.env.MONGO_URL);
    await categoryModel.create({
      name: "Category to delete",
      slug: "category to delete",
    });
    await page.goto("http://localhost:3000/login");

    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill("admin@test.sg");
    await page.getByRole("textbox", { name: "Enter Your Password" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill("admin@test.sg");
    await page.getByRole("button", { name: "LOGIN" }).click();
    await page.waitForURL("http://localhost:3000");

    await page.goto("http://localhost:3000/dashboard/admin/create-category");
    await expect(
      page.getByRole("cell", { name: "Category to delete" })
    ).toBeVisible();
    await page
      .getByRole("row", { name: "Category to delete Edit Delete" })
      .getByRole("button")
      .nth(1)
      .click();
    await expect(
      page.getByRole("cell", { name: "Category to delete" })
    ).not.toBeVisible();
    await categoryModel.deleteOne({ name: "Category to delete" });
  });
});
