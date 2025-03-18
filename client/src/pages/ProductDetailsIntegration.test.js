import React from "react"
import { render, waitFor, screen, fireEvent } from "@testing-library/react";
import axios from "axios";
import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import "@testing-library/jest-dom/extend-expect";
import { CartProvider } from "../context/cart";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProductDetails from "./ProductDetails";
import { AuthProvider } from "../context/auth";
import { SearchProvider } from "../context/search";

jest.mock("axios")

describe("Product Details Integration Test", () => {
    const mockProduct = {
        _id: "1",
        name: "Test Product",
        slug: "test-product",
        description: "Test Description",
        price: 100,
        category: {_id: "1", name: "Test Category"}
    }

    const mockRelatedProducts = [
        {
            _id: "456",
            name: "Related Product",
            description: "Related product description",
            price: 49.99,
            slug: "related-product",
        },
    ]

    beforeAll(() => {
        global.matchMedia = jest.fn().mockImplementation((query) => ({
          media: query,
          addListener: jest.fn(),
          removeListener: jest.fn(),
        }));
      });

    beforeEach(() => {
        axios.get.mockImplementation((url) => {
          if (url.includes(`/api/v1/product/get-product/${mockProduct.slug}`)) {
            return Promise.resolve({ data: { product: mockProduct } });
          }
          if (url.includes(`/api/v1/product/related-product/${mockProduct._id}`)) {
            return Promise.resolve({ data: { products: mockRelatedProducts } });
          }
        });
      });

    test("renders product details correctly", async () => {
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
        
        // Check if loading the product details
        await waitFor(() => {
            expect(screen.getByText("Test Product", {exact: false})).toBeInTheDocument();
            expect(screen.getByText("Test Description", {exact: false})).toBeInTheDocument();
            expect(screen.getByText("100", {exact: false})).toBeInTheDocument();
            expect(screen.getByText("Test Category", {exact: false})).toBeInTheDocument();
        }
    )})

    test("adds product to cart", async () => {
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
    
        // Wait for product to load
        await waitFor(() => {
            expect(screen.getByText("Test Product", {exact: false})).toBeInTheDocument()
        });
    
        const addToCartButtons = screen.getAllByText("ADD TO CART");
        fireEvent.click(addToCartButtons[0]);
    
        expect(JSON.parse(localStorage.getItem("cart"))).toEqual([mockProduct]);
      });

    test("renders related product", async () => {
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

        await waitFor(() => {
            expect(screen.getByText("Related Product")).toBeInTheDocument()
            expect(screen.getByText("Related product description", {exact: false})).toBeInTheDocument()
            expect(screen.getByText("49.99", {exact: false})).toBeInTheDocument()
        })
    })
})
