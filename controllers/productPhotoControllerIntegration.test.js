import { afterAll, describe, expect, jest, test } from "@jest/globals";
import { productPhotoController } from "./productController";
import productModel from "../models/productModel";
import mongoose from "mongoose";
import dotenv from "dotenv"
import slugify from "slugify";
import fs from "fs"

dotenv.config();

let mockReq, mockRes, productToBeFound, noPhotoProduct

describe("Integration test for product photo controller", () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URL);

        jest.clearAllMocks();

        productToBeFound = await productModel.create({
            name: "Product to be found",
            slug: slugify("Product to be found"),
            photo: {
                data: fs.readFileSync('./client/public/images/test-image.jpg'),
                contentType: 'image/jpeg',
            },
            description: "Description",
            price: 50,
            category: new mongoose.Types.ObjectId(),
            quantity: 5,
        });

        console.log(productToBeFound)
        mockReq = { params: { pid: productToBeFound._id }}
        mockRes = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            set: jest.fn()
        }
    })

    afterAll(async () => {
        await productModel.findByIdAndDelete(productToBeFound._id);
        await mongoose.connection.close();
    })
    
    test('retrieves product photo successfully', async () => {
        await productPhotoController(mockReq, mockRes)

        expect(mockRes.status).toHaveBeenCalledWith(200)
        expect(mockRes.set).toHaveBeenCalledWith("Content-type", "image/jpeg")
        expect(mockRes.send).toHaveBeenCalledWith(expect.any(Buffer))
    })

    test('retrieves error if product has no photo', async () => {
        noPhotoProduct = await productModel.create({
            name: "Product to be found",
            slug: slugify("Product to be found"),
            description: "Description",
            price: 50,
            category: new mongoose.Types.ObjectId(),
            quantity: 5,   
        })

        mockReq = { params: { pid: noPhotoProduct._id }}
        await productPhotoController(mockReq, mockRes)

        expect(mockRes.status).toHaveBeenCalledWith(500)
        expect(mockRes.send).toHaveBeenCalledWith({
            success: false,
            message: "Photo not found for this product"
        })
        await productModel.findByIdAndDelete(noPhotoProduct._id)
    })
})
