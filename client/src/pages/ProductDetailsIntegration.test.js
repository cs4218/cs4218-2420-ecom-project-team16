import React from "react"
import { render, waitFor, screen, fireEvent } from "@testing-library/react";
import axios from "axios";
import { afterAll, beforeEach, describe, expect, jest, test } from "@jest/globals";
import "@testing-library/jest-dom/extend-expect";
import { CartProvider } from "../context/cart";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProductDetails from "./ProductDetails";
import { AuthProvider } from "../context/auth";
import { SearchProvider } from "../context/search";
import mongoose from "mongoose";
import productModel from "../../../models/productModel"
import categoryModel from "../../../models/categoryModel";
import dotenv from "dotenv"

dotenv.config();
axios.defaults.baseURL = 'http://localhost:6060';

let mockProduct, relatedProduct, mockCategory

describe("Product Details Integration Test", () => {
  
  const renderProductDetails = () => {
    render(
      <AuthProvider>
        <CartProvider>
          <SearchProvider>
            <MemoryRouter initialEntries={["/product/test-product"]}>
                <Routes>
                  <Route path="/product/:slug" element={<ProductDetails />} />
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
    slug: "test-category"
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
  
  const relatedProductParams = {
    _id: new mongoose.Types.ObjectId(),
    name: "Related Product",
    slug: "related-product",
    description: "Related Description",
    price: 99.99,
    quantity: 1,
    category: {}
  }

  const excludeId = ({ _id, ...rest }) => rest;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL);

    var options = { upsert: true, new: true, setDefaultsOnInsert: true }
    
    // Upsert a test document into the test database
    mockCategory = await categoryModel.findOneAndUpdate({name: mockCategoryParams.name}, excludeId(mockCategoryParams), options)
    mockProductParams.category = mockCategory
    relatedProductParams.category = mockCategory

    mockProduct = await productModel.findOneAndUpdate({name: mockProductParams.name}, excludeId(mockProductParams), options)
    relatedProduct = await productModel.findOneAndUpdate({name: relatedProductParams.name}, excludeId(relatedProductParams), options)

    await new Promise((resolve) => setTimeout(resolve, 5000));

    global.matchMedia = jest.fn().mockImplementation((query) => ({
      media: query,
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }));
  });

  afterAll(async () => {
    await mongoose.connection.close();
  })

  beforeEach(() => {
    localStorage.clear()
  })

  test("renders product details correctly", async () => {
      renderProductDetails()

      await waitFor(() => {
        expect(screen.getByText("Test Product")).toBeInTheDocument();
        expect(screen.getByText("Test Description...")).toBeInTheDocument();
        expect(screen.getByText("$100.00")).toBeInTheDocument();
        expect(screen.getByText(/Category : Test Category/)).toBeInTheDocument();
      })
  })

  test("renders related product", async () => {
    renderProductDetails()

    await waitFor(() => {
      expect(screen.getByText("Related Product")).toBeInTheDocument()
      expect(screen.getByText(/Related Description/)).toBeInTheDocument()
      expect(screen.getByText("$100.00")).toBeInTheDocument()
    })
  })

  test("adds product to cart", async () => {
    renderProductDetails()

    await waitFor(() => {
        expect(screen.getByText(/Test Product/)).toBeInTheDocument()
    });

    const addToCartButtons = screen.getAllByText(/ADD TO CART/);
    fireEvent.click(addToCartButtons[0]);

    const cart = JSON.parse(localStorage.getItem("cart"));

    expect(cart[0]._id).toEqual(mockProduct._id.toString())
  });

  test("adds related product to cart", async () => {
    renderProductDetails()

    await waitFor(() => {
        expect(screen.getByText(/Similar Products/)).toBeInTheDocument()
    });

    const addToCartButton = screen.getAllByTestId("related-cart-button")[1];
    fireEvent.click(addToCartButton);

    const cart = JSON.parse(localStorage.getItem("cart"));
    expect(cart[0]._id).toEqual(relatedProduct._id.toString())
  });
})
