import { expect, jest } from "@jest/globals";
import { updateProductController } from "./productController";
import productModel from "../models/productModel";

jest.mock("../models/productModel.js")
jest.mock("../models/categoryModel.js")

describe("Update Product Controller Test", () => {
  let req, res;

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
        files: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    productModel.findByIdAndUpdate.mockResolvedValue({
        ...req.fields,
        slug: 'updated-product',
        save: jest.fn().mockResolvedValue(true),
    });

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

//   test("should update product image successfully", async () => {
//     req.files = {
//         photo: {
//             path: "/fake/path/to/photo.jpg",
//             size: 500000,
//             type: "image/jpeg"
//         }
//     }
//     await updateProductController(req, res)

//     // Check that fs.readFileSync was called
//     expect(fs.readFileSync).toHaveBeenCalledWith(req.files.photo.path)

//     // Check that the product photo was updated
//     expect(mockProduct.photo.data).toEqual(Buffer.from("fakeImageData"));
//     expect(mockProduct.photo.contentType).toBe("image/jpeg");
//   })

  test("should return error if name is missing", async () => {
    req.fields.name = null;

    await updateProductController(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.send).toHaveBeenCalledWith({
        error: "Name is Required"
    })
  })

  test("should return error if description is missing", async () => {
    req.fields.description = null;

    await updateProductController(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.send).toHaveBeenCalledWith({
        error: "Description is Required"
    })
  })

  test("should return error if price is missing", async () => {
    req.fields.price = null;

    await updateProductController(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.send).toHaveBeenCalledWith({
        error: "Price is Required"
    })
  })

  test("should return error if category is missing", async () => {
    req.fields.category = null;

    await updateProductController(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.send).toHaveBeenCalledWith({
        error: "Category is Required"
    })
  })

  test("should return error if quantity is missing", async () => {
    req.fields.quantity = null;

    await updateProductController(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.send).toHaveBeenCalledWith({
        error: "Quantity is Required"
    })
  })

  test("should return error if photo size exceeds 1000000", async () => {
    req.files = {
        photo: { path: "/large-image.jpg", size: 1000001, type: "image/jpeg" },
    }

    await updateProductController(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.send).toHaveBeenCalledWith({
        error: "photo is Required and should be less then 1mb"
    })
  })
  
  test("should return error if unexpected error", async () => {
    productModel.findByIdAndUpdate.mockRejectedValue(new Error("Database error"));

    await updateProductController(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.send).toHaveBeenCalledWith({
        success: false,
        error: expect.any(Error),
        message: "Error in Updte product",
    })
  })
});
