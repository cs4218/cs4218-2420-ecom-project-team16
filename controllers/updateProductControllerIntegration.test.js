import { afterAll, beforeEach, afterEach, describe, expect, jest, test } from "@jest/globals";
import { updateProductController } from "./productController";
import productModel from "../models/productModel";
import mongoose from "mongoose";
import dotenv from "dotenv"
import slugify from "slugify";
import fs from "fs"

dotenv.config();

let updatedCategoryId, productToBeFound, mockReq, mockRes

describe("Integration test for update product controller", () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URL);
    })

    afterAll(async () => {
        await mongoose.connection.close();
    })

    beforeEach(async () => {
        jest.clearAllMocks();   
        
        updatedCategoryId = new mongoose.Types.ObjectId()
        productToBeFound = await productModel.create({
            name: "Product to be updated",
            slug: slugify("Product to be updated"),
            photo: {
                data: fs.readFileSync('./client/public/images/test-image.jpg'),
                contentType: 'image/jpeg',
            },
            description: "Description to be updated",
            price: 50,
            category: new mongoose.Types.ObjectId(),
            quantity: 5,
        });
        
        mockReq = {
            params: { pid: productToBeFound._id },
            fields: {
              name: "Updated product name",
              description: "Updated description",
              price: 100,
              category: updatedCategoryId,
              quantity: 10,
            },
            files: {},
        }
        mockRes = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            set: jest.fn()
        }
    })
    
    afterEach(async () => {
        await productModel.deleteOne({ name: "Updated product name" })
    })

    test('updates product successfully', async () => {
        const beforeUpdate = await productModel.findOne({ name: "Updated product name" });
        expect(beforeUpdate).toBeNull();

        await updateProductController(mockReq, mockRes)

        expect(mockRes.status).toHaveBeenCalledWith(201)
        expect(mockRes.send).toHaveBeenCalledWith({
            success: true,
            message: "Product updated successfully",
            products: expect.any(Object),
        })

        const createdProduct = await productModel.findOne({ name: "Updated product name" });
        expect(createdProduct).not.toBeNull();
    })
})
