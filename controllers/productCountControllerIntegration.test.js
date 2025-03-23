import { afterAll, beforeEach, describe, expect, jest, test } from "@jest/globals";
import { productCountController } from "./productController";
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

    beforeEach(async () => {
        jest.clearAllMocks();

        mockReq = {}
        mockRes = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            set: jest.fn()
        }
    })

    test('retrieves product count successfully', async () => {
        await productCountController(mockReq, mockRes)

        expect(mockRes.status).toHaveBeenCalledWith(200)
        expect(mockRes.send).toHaveBeenCalledWith({
            success: true,
            total: expect.any(Number),
        })
    })
})
