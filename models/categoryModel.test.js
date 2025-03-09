import categoryModel from "./categoryModel";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

describe("Test categoryModel", () => {
  let categoryData;
  beforeEach(async () => {
    await mongoose.connect(process.env.MONGO_URL);
    categoryData = {};
  });

  afterEach(async () => {
    await mongoose.connection.close();
  });

  test("Save correctly", async () => {
    categoryData.name = "Mock Category";
    categoryData.slug = "slug";
    const category = new categoryModel(categoryData);
    const savedCategory = await category.save();

    expect(savedCategory._id).toBeDefined();
    expect(savedCategory.name).toBe("Mock Category");
    expect(savedCategory.slug).toBe("slug");
  });
});
