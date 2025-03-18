import { afterAll, beforeEach, afterEach, describe, expect, jest, test } from "@jest/globals";
import { getProductController } from "./productController";
import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config();

let mockReq, mockRes

describe("Integration test for create product controller", () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URL);
    })

    afterAll(async () => {
        await mongoose.connection.close();
    })

    beforeEach(() => {
        jest.clearAllMocks();    
        mockReq = {}
        mockRes = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            set: jest.fn()
        }
    })

    test('retreives all products successfully', async () => {
        await getProductController(mockReq, mockRes)

        expect(mockRes.status).toHaveBeenCalledWith(200)
        expect(mockRes.send).toHaveBeenCalledWith({
            success: true,
            countTotal: expect.any(Number),
            message: "All products",
            products: expect.any(Array),
        })
    })
})
