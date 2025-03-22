import { afterAll, beforeEach, afterEach, describe, expect, jest, test } from "@jest/globals";
import { createProductController, productFiltersController } from "./productController";
import productModel from "../models/productModel";
import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config();

let mockCategory, mockProduct, mockReq, mockRes

describe("Integration test for create product controller", () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URL);
    })

    afterAll(async () => {
        await mongoose.connection.close();
    })

    beforeEach(() => {
        jest.clearAllMocks();    
        mockCategory = {_id: new mongoose.Types.ObjectId(), name: "Category", slug: "test-category"}
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
                path: './client/public/images/test-image.jpg',
                type: 'image/jpeg'
                }
            }
        }
        mockRes = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            set: jest.fn()
        }
    })
    
    afterEach(async () => {
        await productModel.deleteOne({ name: "Updated product" })
    })

    test('creates new product successfully', async () => {
        await createProductController(mockReq, mockRes)

        expect(mockRes.status).toHaveBeenCalledWith(201)
        expect(mockRes.send).toHaveBeenCalledWith({
            success: true,
            message: "Product created successfully",
            products: expect.any(Object),
        })

        const createdProduct = await productModel.findOne({ name: "Updated product" });
        expect(createdProduct).not.toBeNull();
    })
})
