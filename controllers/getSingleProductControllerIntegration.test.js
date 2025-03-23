import { afterAll, beforeEach, afterEach, describe, expect, jest, test } from "@jest/globals";
import { getSingleProductController } from "./productController";
import productModel from "../models/productModel";
import mongoose from "mongoose";
import dotenv from "dotenv"
import slugify from "slugify";

dotenv.config();

let mockReq, mockRes, productToBeFound

describe("Integration test for get single product controller", () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URL);
    })

    afterAll(async () => {
        await mongoose.connection.close();
    })

    beforeEach(async () => {
        jest.clearAllMocks();

        productToBeFound = await productModel.create({
            name: "Product to be found",
            slug: slugify("Product to be found"),
            description: "Description",
            price: 50,
            category: new mongoose.Types.ObjectId(),
            quantity: 5,
        });

        mockReq = {
            params: { slug: slugify("Product to be found") },
        }
        mockRes = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            set: jest.fn()
        }
    })
    
    afterEach(async () => {
        await productModel.deleteOne({ name: "Product to be found" })
    })

    test('retrieves a single product successfully', async () => {
        await getSingleProductController(mockReq, mockRes)

        const foundProduct = await productModel.findOne({ name: "Product to be found" });
        expect(foundProduct).not.toBeNull();
    })
})
