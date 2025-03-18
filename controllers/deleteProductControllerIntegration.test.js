import { afterAll, beforeEach, afterEach, describe, expect, jest, test } from "@jest/globals";
import { deleteProductController } from "./productController";
import productModel from "../models/productModel";
import mongoose from "mongoose";
import dotenv from "dotenv";
import slugify from "slugify";

dotenv.config();

let mockReq, mockRes, productToBeDeleted

describe("Integration test for create product controller", () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URL);
    })

    afterAll(async () => {
        await mongoose.connection.close();
    })

    beforeEach(async () => {
        jest.clearAllMocks();

        productToBeDeleted = await productModel.create({
            name: "Product to be deleted",
            slug: slugify("Product to be deleted"),
            description: "Description",
            price: 50,
            category: new mongoose.Types.ObjectId(),
            quantity: 5,
        });

        mockReq = {
            params: { pid: productToBeDeleted._id },
        }
        mockRes = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            set: jest.fn()
        }
    })

    afterEach(async () => {
        const deletedProduct = await productModel.findById(productToBeDeleted._id);
        if (deletedProduct) {
            await deletedProduct.deleteOne()
        }
    })
    
    test('deletes a product successfully', async () => {
        await deleteProductController(mockReq, mockRes)

        expect(mockRes.status).toHaveBeenCalledWith(200)
        expect(mockRes.send).toHaveBeenCalledWith({
            success: true,
            message: "Product deleted successfully",
        })

        const deletedProduct = await productModel.findById(productToBeDeleted._id)
        expect(deletedProduct).toBeNull()
    })
})
