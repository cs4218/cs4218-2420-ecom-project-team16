import { relatedProductController } from "./productController";
import dotenv from "dotenv";
import express from "express";
import request from "supertest";
import { ObjectId } from "mongodb";
import mongoose from "mongoose";

const app = express();
app.use(express.json());
app.get('/api/related-product/:pid/:cid', relatedProductController);
dotenv.config()

describe('Related Product Controller Integration Test', () => {
  beforeAll(async () => {
      await mongoose.connect(process.env.MONGO_URL, {
          useNewUrlParser: true,
          useUnifiedTopology: true
      });
  })

  afterAll(async () => {
      await mongoose.connection.close();
  });
    test("return related products", async () => {
        const pid = new ObjectId('66db427fdb0119d9234b27f1');
        const cid = new ObjectId('66db427fdb0119d9234b27ef');
        const response = await request(app).get(`/api/related-product/${pid}/${cid}`);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
            products: expect.arrayContaining([
              expect.not.objectContaining({ 
                name: 'Laptop', 
                price: 1499.99, 
              }),
              expect.not.objectContaining({ 
                name: 'Textbook', 
                price: 79.99, 
              }),
              expect.not.objectContaining({ 
                name: 'Smartphone', 
                price: 999.99, 
              }),
              expect.objectContaining({ 
                name: 'The Law of Contract in Singapore', 
                price: 54.99, 
              }),
              expect.objectContaining({ 
                name: 'Novel', 
                price: 14.99, 
              }),
              expect.not.objectContaining({ 
                name: 'NUS T-shirt', 
                price: 4.99, 
              }),
            ])
          }); 
    });
});