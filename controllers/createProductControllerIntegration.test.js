import { afterAll, beforeEach, afterEach, describe, expect, jest, test } from "@jest/globals";
import { createProductController, productFiltersController } from "./productController";
import productModel from "../models/productModel";
import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config();

let mockCategory, mockReq, mockRes

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
        mockReq = {
            params: { pid: "someProductId", slug: "updated-product" },
            fields: {
              name: "Some product",
              description: "Some description",
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
        await productModel.deleteOne({ name: "Some product" })
    })

    test('creates new product successfully', async () => {
        const initialState = await productModel.findOne({name: "Some product"})
        expect(initialState).toBeNull()

        await createProductController(mockReq, mockRes)

        const createdProduct = await productModel.findOne({ name: "Some product" });
        expect(createdProduct).not.toBeNull();
    })
})
