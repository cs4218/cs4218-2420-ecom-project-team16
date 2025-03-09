import productModel from "./productModel";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

describe("Test productModel", () => {
  let productData;
  beforeEach(async () => {
    await mongoose.connect(process.env.MONGO_URL);

    productData = {
      slug: "slug",
      description: "description",
      price: 100,
      category: new mongoose.Types.ObjectId(),
      quantity: 1,
    };
  });

  afterEach(async () => {
    await mongoose.connection.close();
  });

  test("Save correctly", async () => {
    productData.name = "Mock Product";
    const product = new productModel(productData);
    const savedProduct = await product.save();

    expect(savedProduct._id).toBeDefined();
    expect(savedProduct.name).toBe("Mock Product");
    expect(savedProduct.slug).toBe("slug");
    expect(savedProduct.description).toBe("description");
    expect(savedProduct.price).toBe(100);
    expect(savedProduct.quantity).toBe(1);
  });

  test("Error occurs upon missing name field", async () => {
    let error;
    try {
      const product = new productModel(productData);
      const savedProduct = await product.save();
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
  });
});
