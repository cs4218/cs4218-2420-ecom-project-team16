import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { createProductController, deleteProductController, getProductController, getSingleProductController, productCountController, productPhotoController, updateProductController } from "./productController";
import productModel from "../models/productModel";
import fs from "fs"
import braintree from "braintree";
import mongoose from "mongoose";

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
let dbError

beforeEach(() => {
  jest.clearAllMocks()
  jest.spyOn(console, 'log').mockImplementation(() => {})

  mockCategory = {_id: "someCategoryId", name: "Category", slug: "test-category"}
  mockProduct = {
    photo: { data: null, contentType: null },
    slug: 'updated-product',
    save: jest.fn().mockResolvedValue(true),
  };
  mockReq = {
    params: { pid: "someProductId", slug: "updated-product" },
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
    send: jest.fn(),
    set: jest.fn()
  }

  dbError = new Error("Database error")
})

describe("Create Product Controller Test", () => {
  beforeEach(() => {
    productModel.mockImplementation(() => mockProduct)
    fs.readFileSync.mockReturnValue(Buffer.from("fakeImageData"))
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

  test("should handle file read error", async () => {
    jest.spyOn(fs, "readFileSync").mockImplementation(() => {
      throw new Error("Error reading image data");
    });

    await createProductController(mockReq, mockRes);

    expect(console.log).toHaveBeenCalledWith(expect.any(Error));
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: false,
      error: expect.any(Error),
      message: "Error in crearing product",
    });
  })

  test("should handle save product error", async () => {
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

describe("Get Product Controller Test", () => {
  let mockProducts;

  beforeEach(() => {
    jest.clearAllMocks()

    mockProducts = [
      {
        name: "Product 1",
        slug: "product-1",
        description: "Description for product 1",
        price: 100,
        category: {
          _id: new mongoose.Types.ObjectId(),
          name: "Category 1"
        },
        quantity: 10,
        photo: {
          data: Buffer.from("mock-image-1"),
          contentType: "image/jpeg"
        },
        shipping: true,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01")
      },
      {
        name: "Product 2",
        slug: "product-2",
        description: "Description for product 2",
        price: 200,
        category: {
          _id: new mongoose.Types.ObjectId(),
          name: "Category 2"
        },
        quantity: 5,
        photo: {
          data: Buffer.from("mock-image-2"),
          contentType: "image/jpeg"
        },
        shipping: false,
        createdAt: new Date("2024-01-02"),
        updatedAt: new Date("2024-01-02")
      }
    ];

    // Set up the mock query chain that actually returns the mock products
    const mockFind = jest.fn().mockReturnThis();
    const mockPopulate = jest.fn().mockReturnThis();
    const mockSelect = jest.fn().mockReturnThis();
    const mockLimit = jest.fn().mockReturnThis();
    const mockSort = jest.fn().mockResolvedValue(mockProducts);

    // Attach all methods to the find method
    mockFind.populate = mockPopulate;
    mockFind.select = mockSelect;
    mockFind.limit = mockLimit;
    mockFind.sort = mockSort;

    productModel.find = jest.fn().mockReturnValue(mockFind);

  })
  
  test("should get all products successfully (brittle)", async () => {
    await getProductController(mockReq, mockRes);

    // Verify query chain methods were called
    expect(productModel.find).toHaveBeenCalledWith({});
    
    const findResult = productModel.find();
    expect(findResult.populate).toHaveBeenCalledWith("category");
    expect(findResult.select).toHaveBeenCalledWith("-photo");
    expect(findResult.limit).toHaveBeenCalledWith(12);
    expect(findResult.sort).toHaveBeenCalledWith({ createdAt: -1 });

    // Verify response
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: true,
      counTotal: mockProducts.length,
      message: "ALlProducts ",
      products: mockProducts
    });
  })

  test("should get all products successfully (generic)", async () => {
    await getProductController(mockReq, mockRes);

    // Verify query chain methods were called
    expect(productModel.find).toHaveBeenCalledWith({});
    
    const findResult = productModel.find();
    expect(findResult.populate).toHaveBeenCalledWith(expect.any(String));
    expect(findResult.select).toHaveBeenCalledWith(expect.stringMatching(/^-?\w+$/));
    expect(findResult.limit).toHaveBeenCalledWith(expect.any(Number))

    const limitArg = findResult.limit.mock.calls[0][0];
    expect(limitArg).toBeGreaterThanOrEqual(0);

    expect(findResult.sort).toHaveBeenCalledWith({ createdAt: -1 });

    // Verify response
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: true,
      counTotal: mockProducts.length,
      message: "ALlProducts ",
      products: mockProducts
    });
  })

  test("should handle empty product list", async () => {
    // Mock empty results
    const emptyFind = jest.fn().mockReturnThis();
    emptyFind.populate = jest.fn().mockReturnThis();
    emptyFind.select = jest.fn().mockReturnThis();
    emptyFind.limit = jest.fn().mockReturnThis();
    emptyFind.sort = jest.fn().mockResolvedValue([]);
    
    productModel.find = jest.fn().mockReturnValue(emptyFind);

    await getProductController(mockReq, mockRes);

    // Verify response
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: true,
      counTotal: 0,
      message: "ALlProducts ",
      products: []
    });
  })

  test("should handle database error", async () => {
    const errorFind = jest.fn().mockReturnThis();
    errorFind.populate = jest.fn().mockReturnThis();
    errorFind.select = jest.fn().mockReturnThis();
    errorFind.limit = jest.fn().mockReturnThis();
    errorFind.sort = jest.fn().mockRejectedValue(dbError);
    
    productModel.find = jest.fn().mockReturnValue(errorFind);

    await getProductController(mockReq, mockRes);

    expect(console.log).toHaveBeenCalledWith(expect.any(Error));
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: false,
      message: "Erorr in getting products",
      error: "Database error"
    });
  })
})

describe("Get Single Product Controller Test", () => {
  let mockProducts;

  beforeEach(() => {
    jest.clearAllMocks()

    mockProducts = [
      {
        name: "Product 1",
        slug: "product-1",
        description: "Description for product 1",
        price: 100,
        category: {
          _id: new mongoose.Types.ObjectId(),
          name: "Category 1"
        },
        quantity: 10,
        photo: {
          data: Buffer.from("mock-image-1"),
          contentType: "image/jpeg"
        },
        shipping: true,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01")
      }
    ];

    // Set up the mock query chain that actually returns the mock products
    const mockFindOne = jest.fn().mockReturnThis();
    const mockSelect = jest.fn().mockReturnThis();
    const mockPopulate = jest.fn().mockResolvedValue(mockProducts);

    // Attach all methods to the find method
    mockFindOne.populate = mockPopulate;
    mockFindOne.select = mockSelect;

    productModel.findOne = jest.fn().mockReturnValue(mockFindOne);

  })

  test("should get product if exists", async () => {
    await getSingleProductController(mockReq, mockRes)

    // Verify query chain methods were called
    expect(productModel.findOne).toHaveBeenCalledWith({ slug: "updated-product"});
    
    const findResult = productModel.findOne();
    expect(findResult.select).toHaveBeenCalledWith("-photo");
    expect(findResult.populate).toHaveBeenCalledWith("category");

    // Verify response
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: true,
      message: "Single Product Fetched",
      product: mockProducts
    });
  })

  test("should get product if exists (generic)", async () => {
    await getSingleProductController(mockReq, mockRes)

    // Verify query chain methods were called
    expect(productModel.findOne).toHaveBeenCalledWith({ slug: "updated-product"});
    
    const findResult = productModel.findOne();
    expect(findResult.select).toHaveBeenCalledWith(expect.stringMatching(/^-?\w+$/));
    expect(findResult.populate).toHaveBeenCalledWith(expect.any(String));

    // Verify response
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: true,
      message: "Single Product Fetched",
      product: mockProducts
    });
  })

  test("should handle database error", async () => {
    const errorFindOne = jest.fn().mockReturnThis();
    errorFindOne.select = jest.fn().mockReturnThis();
    errorFindOne.populate = jest.fn().mockRejectedValue(dbError);
    
    productModel.findOne = jest.fn().mockReturnValue(errorFindOne);

    await getSingleProductController(mockReq, mockRes);

    expect(console.log).toHaveBeenCalledWith(expect.any(Error));
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: false,
      message: "Eror while getitng single product",
      error: "Database error"
    });
  })
})

describe("Get Single Product Photo Controller Test", () => {
  let mockFindById
  beforeEach(() => {
    // Set up the mock query chain that actually returns the mock products
    mockFindById = jest.fn().mockReturnThis();
    const mockSelect = jest.fn().mockResolvedValue({
      photo: {
        data: Buffer.from("fakeImageData"),
        contentType: "image/jpeg"
      }
    });

    // Attach all methods to the find method
    mockFindById.select = mockSelect;

    productModel.findById = jest.fn().mockReturnValue(mockFindById);
  })

  test("should get photo if product photo exists", async () => {
    await productPhotoController(mockReq, mockRes)

    // Verify query chain methods were called
    expect(productModel.findById).toHaveBeenCalledWith("someProductId")

    const findByIdResult = productModel.findById();
    expect(findByIdResult.select).toHaveBeenCalledWith("photo")

    // Verify response
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.set).toHaveBeenCalledWith("Content-type", "image/jpeg")
    expect(mockRes.send).toHaveBeenCalledWith(Buffer.from("fakeImageData"))
  })

  test("should handle case if product has no photo", async () => {
    jest.spyOn(productModel, "findById").mockReturnValue({
      select: jest.fn().mockResolvedValue({ photo: { data: null } }),
    });

    await productPhotoController(mockReq, mockRes)

    // Verify query chain methods were called
    expect(productModel.findById).toHaveBeenCalledWith("someProductId")

    // Verify response
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: false,
      message: "Photo not found for this product",
    });
  })

  test("should handle database error", async () => {
    mockFindById.select = jest.fn().mockRejectedValue(dbError);
    await productPhotoController(mockReq, mockRes)

    // Verify query chain methods were called
    expect(productModel.findById).toHaveBeenCalledWith("someProductId")

    // Verify response
    expect(console.log).toHaveBeenCalledWith(expect.any(Error));
    expect(mockRes.status).toHaveBeenCalledWith(500)
    expect(mockRes.send).toHaveBeenCalledWith({
      success: false,
      message: "Erorr while getting photo",
      error: "Database error",
    })
  })
})

describe("Delete Product Controller Test", () => {
  let mockFindByIdAndDelete
  let mockSelect

  beforeEach(() => {
    jest.clearAllMocks()

    mockFindByIdAndDelete = jest.fn().mockReturnThis()
    mockSelect = jest.fn().mockResolvedValue({})
    mockFindByIdAndDelete.select = mockSelect

    productModel.findByIdAndDelete = jest.fn().mockReturnValue(mockFindByIdAndDelete)
  })

  test("should delete product if exists or not", async () => {
    await deleteProductController(mockReq, mockRes)

    // Verify query chain methods were called
    expect(productModel.findByIdAndDelete).toHaveBeenCalledWith("someProductId")

    const findByIdAndDeleteResult = productModel.findByIdAndDelete()
    expect(findByIdAndDeleteResult.select).toHaveBeenCalledWith("-photo")

    // Verify response
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.send).toHaveBeenCalledWith({
      success: true,
      message: "Product Deleted successfully",
    })
  })

  test("should handle database error", async () => {
    mockFindByIdAndDelete.select = jest.fn().mockRejectedValue(dbError);

    await deleteProductController(mockReq, mockRes)

    // Verify query chain methods were called
    expect(productModel.findByIdAndDelete).toHaveBeenCalledWith("someProductId")

    const findByIdAndDeleteResult = productModel.findByIdAndDelete()
    expect(findByIdAndDeleteResult.select).toHaveBeenCalledWith("-photo")

    // Verify response
    expect(console.log).toHaveBeenCalledWith(expect.any(Error));
    expect(mockRes.status).toHaveBeenCalledWith(500)
    expect(mockRes.send).toHaveBeenCalledWith({
      success: false,
      message: "Error while deleting product",
      error: "Database Error"
    })
  })
})

describe("Update Product Controller Test", () => {
  beforeEach(() => {
    productModel.findByIdAndUpdate.mockResolvedValue(mockProduct);
    fs.readFileSync.mockReturnValue(Buffer.from("fakeImageData"))
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

  test("should handle findByIdAndUpdate error", async () => {
    productModel.findByIdAndUpdate.mockRejectedValue(dbError);
    await updateProductController(mockReq, mockRes);
    expect(console.log).toHaveBeenCalledWith(expect.any(Error));
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: false,
      error: expect.any(Error),
      message: "Error in Updte product",
    });
  });

  test("should handle file read error", async () => {
    jest.spyOn(fs, "readFileSync").mockImplementation(() => {
      throw new Error("Error reading image data");
    });

    await updateProductController(mockReq, mockRes);
    expect(console.log).toHaveBeenCalledWith(expect.any(Error));
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: false,
      error: expect.any(Error),
      message: "Error in Updte product",
    });
  })

  test("should handle save product error", async () => {
    mockProduct = {
      photo: { data: null, contentType: null },
      slug: 'updated-product',
      save: jest.fn().mockRejectedValueOnce(new Error("Error in Updte product")),
    };

    productModel.findByIdAndUpdate.mockResolvedValue(mockProduct);

    await updateProductController(mockReq, mockRes);
    expect(console.log).toHaveBeenCalledWith(expect.any(Error));
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith({
      success: false,
      error: expect.any(Error),
      message: "Error in Updte product",
    });
  })
})

describe("Product Count Controller Test", () => {
  test("should get correct count", async () => {
    mockFind = jest.fn().mockReturnThis()
    mockFind.estimatedDocumentCount = jest.fn().mockResolvedValue(12)
    productModel.find = jest.fn().mockReturnValue(mockFind)

    await productCountController(mockReq, mockRes)

    // Verify query chain methods were called
    expect(productModel.find).toHaveBeenCalledWith({})
    mockFindResult = productModel.find()
    expect(mockFindResult.estimatedDocumentCount).toHaveBeenCalled()

    // Verify response
    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.send).toHaveBeenCalledWith({
      success: true,
      total: 12
    })
  })

  test("should handle database error", async () => {
    mockFind = jest.fn().mockReturnThis()
    mockFind.estimatedDocumentCount = jest.fn().mockRejectedValue(dbError)
    productModel.find = jest.fn().mockReturnValue(mockFind)
    await productCountController(mockReq, mockRes)
    
    // Verify query chain methods were called
    expect(productModel.find).toHaveBeenCalledWith({})
    mockFindResult = productModel.find()
    expect(mockFindResult.estimatedDocumentCount).toHaveBeenCalled()

    // Verify response
    expect(console.log).toHaveBeenCalledWith(expect.any(Error));
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.send).toHaveBeenCalledWith({
      message: "Error in product count",
      error: "Database Error",
      success: false,
    })
  })
})
