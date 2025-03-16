import { jest } from "@jest/globals";
import { updateCategoryController } from "./categoryController";
import categoryModel from "../models/categoryModel.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import slugify from "slugify";

dotenv.config();
const newCatName = "Category been updated";
const newCatSlug = slugify(newCatName, { lower: true, strict: true });
const oldCatName = "Category to update";
const oldCatSlug = slugify(oldCatName, { lower: true, strict: true });

describe("Integration test for Update Category Controller", () => {
  let req, res;
  let id;
  jest.setTimeout(10000); // 10 seconds

  beforeEach(async () => {
    jest.clearAllMocks();
    await mongoose.connect(process.env.MONGO_URL);
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  afterEach(async () => {
    await categoryModel.deleteOne({ name: oldCatName });
    await categoryModel.deleteOne({ name: newCatName });
    await mongoose.connection.close();
  });

  test("category not updated when category does not exist in DB", async () => {
    req = { body: { name: "Updated Category" }, params: { id: "zzz" } };

    await updateCategoryController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test("category updated in DB when category exists", async () => {
    const testCategory = await categoryModel.create({
      name: oldCatName,
      slug: oldCatSlug,
    });
    id = testCategory.id;
    console.log("ID is : ");
    console.log(id);

    req = { body: { name: newCatName }, params: { id: id } };

    await updateCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);

    const category = await categoryModel.findOne({ name: newCatName });
    expect(category).not.toBeNull();
    expect(category.name).toBe(newCatName);
    expect(category.slug).toBe(newCatSlug);
    await categoryModel.deleteOne({ name: newCatName });
  });
});
