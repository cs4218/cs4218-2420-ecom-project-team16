import React from "react"
import { render, waitFor, screen } from "@testing-library/react";
import axios from "axios";
import { afterAll, describe, expect, jest, test } from "@jest/globals";
import "@testing-library/jest-dom/extend-expect";
import { CartProvider } from "../../context/cart";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../../context/auth";
import { SearchProvider } from "../../context/search";
import Products from "./Products";
import mongoose from "mongoose";
import productModel from "../../../../models/productModel";
import categoryModel from "../../../../models/categoryModel";
import dotenv from "dotenv"

dotenv.config();
axios.defaults.baseURL = 'http://localhost:6060';

let mockProduct, mockCategory

describe("Products Integration Test", () => {

  const renderProducts = () => {
    render(
      <AuthProvider>
        <CartProvider>
          <SearchProvider>
            <MemoryRouter initialEntries={["/dashboard/admin/products"]}>
              <Routes>
                <Route path="/dashboard/admin/products" element={<Products/>} />
              </Routes>
            </MemoryRouter>
          </SearchProvider>
        </CartProvider>
      </AuthProvider>
    );
  }

  const mockCategoryParams = {
    _id: new mongoose.Types.ObjectId(),
    name: "Test Category",
    slug: "mock-test-category"
  }

  const mockProductParams = {
    _id: new mongoose.Types.ObjectId(),
    name: "Test Product",
    slug: "test-product",
    description: "Test Description",
    price: 100,
    quantity: 1,
    category: {}
  }

  const excludeId = ({ _id, ...rest }) => rest;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL);
    
    var options = { upsert: true, new: true, setDefaultsOnInsert: true }
    mockCategory = await categoryModel.findOneAndUpdate({name: mockCategoryParams.name}, excludeId(mockCategoryParams), options)
    mockProductParams.category = mockCategory

    mockProduct = await productModel.findOneAndUpdate({name: mockProductParams.name}, excludeId(mockProductParams), options)

    global.matchMedia = jest.fn().mockImplementation((query) => ({
      media: query,
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }));
  });

  afterAll(async () => {
      await productModel.deleteOne({name: mockProductParams.name});
      await categoryModel.deleteOne({name: mockCategoryParams.name});
      await mongoose.connection.close();
  })

  test("renders product details correctly", async () => {
    renderProducts()
    
    await waitFor(() => {
        expect(screen.getByText(/Test Product/)).toBeInTheDocument();
    })
    expect(screen.getByText(/Test Description/)).toBeInTheDocument()
  })

})
