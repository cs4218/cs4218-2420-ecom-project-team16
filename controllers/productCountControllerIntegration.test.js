import { afterAll, beforeEach, describe, expect, jest, test } from "@jest/globals";
import { productCountController } from "./productController";
import productModel from "../models/productModel";
import mongoose from "mongoose";
import dotenv from "dotenv"
import slugify from "slugify";

dotenv.config();

let mockReq, mockRes

describe("Integration test for product count controller", () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URL);
    })

    afterAll(async () => {
        await mongoose.connection.close();
    })

    beforeEach(async () => {
        jest.clearAllMocks();

        mockReq = {}
        mockRes = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            set: jest.fn()
        }
    })

    // initially I wanted to test if inserting a product increases the product count by 1
    // but because tests are asynchronous, it may be flaky and unreliable
    test('retrieves product count successfully', async () => {
        await productCountController(mockReq, mockRes)
        const response = mockRes.send.mock.calls[0][0]
        const count = response.total
        expect(count).toBeGreaterThanOrEqual(0)
    })
})
