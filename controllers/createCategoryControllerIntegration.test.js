import { jest } from "@jest/globals";
import { createCategoryController } from "./categoryController";
import categoryModel from "../models/categoryModel.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import slugify from "slugify";

dotenv.config();

describe("Integration test for Create Category Controller", () => {
  let req, res;
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
    await mongoose.connection.close();
  });

  test("category not created when category already exists in DB", async () => {
    req = { body: { name: "Electronics" } };

    await createCategoryController(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      message: "Category Already Exists",
      success: false,
    });
  });
  test("category created in DB when category doesn't exist yet", async () => {
    const newCatName = "New Category";
    req = { body: { name: newCatName } };

    await createCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(201);

    const category = await categoryModel.findOne({ name: newCatName });
    expect(category).not.toBeNull();
    expect(category.name).toBe(newCatName);
    expect(category.slug).toBe(
      slugify(newCatName, { lower: true, strict: true })
    );
    await categoryModel.deleteOne({ name: newCatName });
  });
});
