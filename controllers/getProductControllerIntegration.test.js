import { afterAll, beforeEach, describe, expect, jest, test } from "@jest/globals";
import { getProductController } from "./productController";
import productModel from "../models/productModel";
import mongoose from "mongoose";
import dotenv from "dotenv"
import slugify from "slugify";

dotenv.config();

let mockReq, mockRes, productToBeRetrieved, deleteProducts

describe("Integration test for get product controller", () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URL);
    })

    afterAll(async () => {
        await mongoose.connection.close();
    })

    beforeEach(async () => {
        jest.clearAllMocks();   
        
        productToBeRetrieved = await productModel.create({
            name: "Product to be retrieved",
            slug: slugify("Product to be retrieved"),
            description: "Description",
            price: 50,
            category: new mongoose.Types.ObjectId(),
            quantity: 5,
        });
        mockReq = {}
        mockRes = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            set: jest.fn()
        }
    })

    afterEach(async () => {
        const deleteProduct = await productModel.findById(productToBeRetrieved._id);
        if (deleteProduct) {
            await deleteProduct.deleteOne()
        }
    })

    test('retreives all products successfully', async () => {
        await getProductController(mockReq, mockRes)

        const response = mockRes.send.mock.calls[0][0]
        const productExists = response.products.some(product => product._id.toString() === productToBeRetrieved._id.toString());
        expect(productExists).toBe(true);
    })
})
