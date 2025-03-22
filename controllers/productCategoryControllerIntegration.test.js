import { describe, jest } from "@jest/globals";
import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import slugify from "slugify";
import { app, server } from "../server.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import request from "supertest";

dotenv.config();
describe("Product Category Controller", () => {
  jest.setTimeout(10000);
  beforeEach(async () => {
    jest.clearAllMocks();
    await mongoose.connect(process.env.MONGO_URL);
  });
  afterEach(async () => {
    await mongoose.connection.close();
    server.close();
  });
  test("status 200 when category and products found", async () => {
    const category = "Book";
    const cat = await categoryModel.findOne({ name: category });
    const categorySlug = slugify(category, { lower: true, strict: true });
    const prods = await productModel.find({ category: cat._id });
    const response = await request(app).get(
      `/api/v1/product/product-category/${categorySlug}`
    );
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      category: expect.objectContaining({ _id: cat._id.toString() }),
      products: expect.arrayContaining([
        expect.objectContaining({ _id: prods[0]._id.toString() }),
      ]),
    });
  });
});
