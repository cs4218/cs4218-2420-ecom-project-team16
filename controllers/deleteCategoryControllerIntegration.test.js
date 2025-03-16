import { jest } from "@jest/globals";
import { deleteCategoryController } from "./categoryController";
import categoryModel from "../models/categoryModel.js";
import slugify from "slugify";
import mongoose from "mongoose";
import dotenv, { config } from "dotenv";

const categoryToAdd = "Category to delete";
const categoryToAddSlug = slugify(categoryToAdd, { lower: true, strict: true });
dotenv.config();
describe("Integration test for Delete Category Controller", () => {
  let req, res, id;
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
  test("sucessfully delete a category", async () => {
    const addedCategory = await categoryModel.create({
      name: categoryToAdd,
      slug: categoryToAddSlug,
    });
    id = addedCategory.id;
    req = { params: { id: id } };
    await deleteCategoryController(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Category Deleted Successfully",
    });
    const shouldNotExistCategory = await categoryModel.findOne({
      name: categoryToAdd,
    });
    expect(shouldNotExistCategory).toBe(null);
  });
  test("error code 500 when category not existent", async () => {
    const nonExistentId = "---";
    req = { params: { id: nonExistentId } };
    await deleteCategoryController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
