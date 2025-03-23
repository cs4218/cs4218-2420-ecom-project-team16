import { jest } from "@jest/globals";
import { singleCategoryController } from "./categoryController";
import categoryModel from "../models/categoryModel.js";
import slugify from "slugify";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const categoryToAdd = "Single Category";
const categoryToAddSlug = slugify(categoryToAdd, { lower: true, strict: true });
describe("Single Category Controller Integration Test ", () => {
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
    await categoryModel.deleteOne({ name: categoryToAdd });
    await mongoose.connection.close();
  });

  test("successfully retrieve single category from DB", async () => {
    // Create a category in the database
    const addedCategory = await categoryModel.create({
      name: categoryToAdd,
      slug: categoryToAddSlug,
    });

    const req = { params: { slug: categoryToAddSlug } };

    await singleCategoryController(req, res);
    expect(res.status).toHaveBeenCalledWith(200);

    const responseData = res.send.mock.calls[0][0];
    expect(responseData.success).toBe(true);
    expect(responseData.message).toBe("Get single category successfully");
    expect(responseData.category).toBeDefined();
    expect(responseData.category._id.toString()).toBe(
      addedCategory._id.toString()
    );
    expect(responseData.category.name).toBe(categoryToAdd);
    expect(responseData.category.slug).toBe(categoryToAddSlug);
    await categoryModel.deleteOne({ name: categoryToAdd });
  });

  test("error code 500 returned when error thrown from DB", async () => {
    req = {};

    await singleCategoryController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
