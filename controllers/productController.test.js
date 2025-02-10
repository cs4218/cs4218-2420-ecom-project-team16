import { expect, jest } from "@jest/globals";
import { updateProductController } from "./productController";
import productModel from "../models/productModel";
import fs from "fs"
import braintree from "braintree";

jest.mock("../models/productModel.js")
jest.mock("../models/categoryModel.js")
jest.mock("fs")
jest.mock('braintree', () => ({
  BraintreeGateway: jest.fn().mockImplementation(() => ({
    transaction: {
      sale: jest.fn().mockResolvedValue({ success: true, transaction: { id: 'fake-id' } }),
    },
  })),
  Environment: {
    Sandbox: 'Sandbox',
  },
}));

describe("Update Product Controller Test", () => {
  let req, res;
  let mockProduct;

  beforeEach(() => {
    jest.clearAllMocks()

    const mockCategory = {
      _id: "someCategoryId",
      name: "Category",
      slug: "test-category",
    }

    req = {
      params: { pid: "someProductId"},
      fields: {
        name: "Updated Product",
        description: "Updated Description",
        price: 100,
        category: mockCategory._id,
        quantity: 10,
      },
      files: {
        photo: {
          size: 500000,
          path: '/temp/test-image.jpg',
          type: 'image/jpeg'
        }
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    // Create a mock product with a save method
    mockProduct = {
      photo: {
        data: null,
        contentType: null,
      },
      slug: 'updated-product',
      save: jest.fn().mockResolvedValue(true),
    };

    productModel.findByIdAndUpdate.mockResolvedValue(mockProduct);
  });

  test("should update product successfully", async () => {
    await updateProductController(req, res)
    
    expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'someProductId',
      {
        ...req.fields,
        slug: expect.any(String),
      },
      { new: true }
    );

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: 'Product Updated Successfully',
      products: expect.any(Object),
    });
  });

  test("should update product image successfully", async () => {
    const mockImageBuffer = Buffer.from("fakeImageData");
    fs.readFileSync.mockReturnValue(mockImageBuffer);

    await updateProductController(req, res);

    // Check that the image was read
    expect(fs.readFileSync).toHaveBeenCalledWith(req.files.photo.path);

    // Check that the product was updated with the new image
    expect(mockProduct.photo.data).toEqual(mockImageBuffer);
    expect(mockProduct.photo.contentType).toBe("image/jpeg");
    expect(mockProduct.save).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Product Updated Successfully",
      products: mockProduct,
    });
  });

  test("should return error if photo size exceeds 1000000", async () => {
    req.files.photo.size = 1000001;

    await updateProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      error: "photo is Required and should be less then 1mb"
    });
    
    // Verify no database operations were attempted
    expect(productModel.findByIdAndUpdate).not.toHaveBeenCalled();
    expect(fs.readFileSync).not.toHaveBeenCalled();
  });

  test("should update product without image if no photo provided", async () => {
    req.files = {};

    await updateProductController(req, res);

    expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'someProductId',
      {
        ...req.fields,
        slug: expect.any(String),
      },
      { new: true }
    );

    // Verify no image operations were performed
    expect(fs.readFileSync).not.toHaveBeenCalled();
    expect(mockProduct.save).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Product Updated Successfully",
      products: mockProduct,
    });
  });

  test("should return error if name is missing", async () => {
    req.fields.name = null;
    await updateProductController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      error: "Name is Required"
    });
  });

  test("should return error if description is missing", async () => {
    req.fields.description = null;
    await updateProductController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      error: "Description is Required"
    });
  });

  test("should return error if price is missing", async () => {
    req.fields.price = null;
    await updateProductController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      error: "Price is Required"
    });
  });

  test("should return error if category is missing", async () => {
    req.fields.category = null;
    await updateProductController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      error: "Category is Required"
    });
  });

  test("should return error if quantity is missing", async () => {
    req.fields.quantity = null;
    await updateProductController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      error: "Quantity is Required"
    });
  });

  test("should return error if unexpected error", async () => {
    productModel.findByIdAndUpdate.mockRejectedValue(new Error("Database error"));
    await updateProductController(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: expect.any(Error),
      message: "Error in Updte product",
    });
  });
});
