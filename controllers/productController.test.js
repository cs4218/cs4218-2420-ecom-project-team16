import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { createProductController, updateProductController } from "./productController";
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

let mockCategory;
let mockProduct;
let mockReq;
let mockRes;

beforeEach(() => {
  jest.clearAllMocks()

  mockCategory = {_id: "someCategoryId", name: "Category", slug: "test-category"}
  mockProduct = {
    photo: { data: null, contentType: null },
    slug: 'updated-product',
    save: jest.fn().mockResolvedValue(true),
  };
  mockReq = {
    params: { pid: "someProductId" },
    fields: {
      name: "Updated product",
      description: "Updated description",
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
  }
  mockRes = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn()
  }

  fs.readFileSync.mockReturnValue(Buffer.from("fakeImageData"))
  productModel.findByIdAndUpdate.mockResolvedValue({
    _id: "someProductId",
    ...mockReq.fields,
    photo: {
        data: Buffer.from("fakeImageData"),
        contentType: "image/jpeg"
    }
  });
})

describe("Create Product Controller Test", () => {
  beforeEach(() => {
    productModel.mockImplementation(() => mockProduct)
  })

  test("should create product with image successfully", async () => {
    const mockImageBuffer = Buffer.from("fakeImageData");
    fs.readFileSync.mockReturnValue(mockImageBuffer)

    await createProductController(mockReq, mockRes)

    // Verify product model was initialize with correct data
    expect(productModel).toHaveBeenCalledWith({
      ...mockReq.fields,
      slug: expect.any(String)
    })

    // Verify image was read
    expect(fs.readFileSync).toHaveBeenCalledWith(mockReq.files.photo.path)

    // Verify image data was set correctly
    expect(mockProduct.photo.data).toEqual(mockImageBuffer);
    expect(mockProduct.photo.contentType).toBe("image/jpeg");

    // Verify product was saved
    expect(mockProduct.save).toHaveBeenCalled();

    // Verify Response
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: true,
      message: "Product Created Successfully",
      products: expect.any(Object),
    });
  })

  test("should create product without image if no photo provided", async () => {
    mockReq.files = {};

    await createProductController(mockReq, mockRes);

    // Verify no image operations occurred
    expect(fs.readFileSync).not.toHaveBeenCalled();
    expect(mockProduct.photo.data).toBeNull();
    expect(mockProduct.photo.contentType).toBeNull();

    // Verify product was saved
    expect(mockProduct.save).toHaveBeenCalled();

    // Verify response
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: true,
      message: "Product Created Successfully",
      products: mockProduct,
    });
  });

  test("should return error if photo size exceeds 1000000", async () => {
    mockReq.files.photo.size = 1000001;

    await createProductController(mockReq, mockRes);

    // Verify error response
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      error: "photo is Required and should be less then 1mb"
    });

    // Verify no product was created
    expect(productModel).not.toHaveBeenCalled();
    expect(fs.readFileSync).not.toHaveBeenCalled();
  });

  test("should return error if name is missing", async () => {
    mockReq.fields.name = null;
    await createProductController(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      error: "Name is Required"
    });
  });

  test("should return error if description is missing", async () => {
    mockReq.fields.description = null;
    await createProductController(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      error: "Description is Required"
    });
  });

  test("should return error if price is missing", async () => {
    mockReq.fields.price = null;
    await createProductController(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      error: "Price is Required"
    });
  });

  test("should return error if category is missing", async () => {
    mockReq.fields.category = null;
    await createProductController(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      error: "Category is Required"
    });
  });

  test("should return error if quantity is missing", async () => {
    mockReq.fields.quantity = null;
    await createProductController(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      error: "Quantity is Required"
    });
  });

  test("should handle database errors", async () => {
    const dbError = new Error("Database error");
    mockProduct.save.mockRejectedValue(dbError);

    await createProductController(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: false,
      error: dbError,
      message: "Error in crearing product",
    });
  });
})


describe("Update Product Controller Test", () => {
  beforeEach(() => {
    productModel.findByIdAndUpdate.mockResolvedValue(mockProduct);
  });

  test("should update product successfully", async () => {
    await updateProductController(mockReq, mockRes)
    
    expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'someProductId',
      {
        ...mockReq.fields,
        slug: expect.any(String),
      },
      { new: true }
    );

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: true,
      message: 'Product Updated Successfully',
      products: expect.any(Object),
    });
  });

  test("should update product image successfully", async () => {
    const mockImageBuffer = Buffer.from("fakeImageData");
    fs.readFileSync.mockReturnValue(mockImageBuffer);

    await updateProductController(mockReq, mockRes);

    // Check that the image was read
    expect(fs.readFileSync).toHaveBeenCalledWith(mockReq.files.photo.path);

    // Check that the product was updated with the new image
    expect(mockProduct.photo.data).toEqual(mockImageBuffer);
    expect(mockProduct.photo.contentType).toBe("image/jpeg");
    expect(mockProduct.save).toHaveBeenCalled();

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: true,
      message: "Product Updated Successfully",
      products: mockProduct,
    });
  });

  test("should return error if photo size exceeds 1000000", async () => {
    mockReq.files.photo.size = 1000001;

    await updateProductController(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      error: "photo is Required and should be less then 1mb"
    });
    
    // Verify no database operations were attempted
    expect(productModel.findByIdAndUpdate).not.toHaveBeenCalled();
    expect(fs.readFileSync).not.toHaveBeenCalled();
  });

  test("should update product without image if no photo provided", async () => {
    mockReq.files = {};

    await updateProductController(mockReq, mockRes);

    expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'someProductId',
      {
        ...mockReq.fields,
        slug: expect.any(String),
      },
      { new: true }
    );

    // Verify no image operations were performed
    expect(fs.readFileSync).not.toHaveBeenCalled();
    expect(mockProduct.save).toHaveBeenCalled();

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: true,
      message: "Product Updated Successfully",
      products: mockProduct,
    });
  });

  test("should return error if name is missing", async () => {
    mockReq.fields.name = null;
    await updateProductController(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      error: "Name is Required"
    });
  });

  test("should return error if description is missing", async () => {
    mockReq.fields.description = null;
    await updateProductController(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      error: "Description is Required"
    });
  });

  test("should return error if price is missing", async () => {
    mockReq.fields.price = null;
    await updateProductController(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      error: "Price is Required"
    });
  });

  test("should return error if category is missing", async () => {
    mockReq.fields.category = null;
    await updateProductController(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      error: "Category is Required"
    });
  });

  test("should return error if quantity is missing", async () => {
    mockReq.fields.quantity = null;
    await updateProductController(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      error: "Quantity is Required"
    });
  });

  test("should return error if unexpected error", async () => {
    productModel.findByIdAndUpdate.mockRejectedValue(new Error("Database error"));
    await updateProductController(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: false,
      error: expect.any(Error),
      message: "Error in Updte product",
    });
  });
})
