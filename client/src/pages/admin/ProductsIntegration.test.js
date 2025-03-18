import React from "react"
import { render, waitFor, screen, fireEvent } from "@testing-library/react";
import axios from "axios";
import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import "@testing-library/jest-dom/extend-expect";
import { CartProvider } from "../../context/cart";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../../context/auth";
import { SearchProvider } from "../../context/search";
import Products from "./Products";

jest.mock("axios")

const generateMockProducts = (count) => {
    const products = [];
    for (let i = 1; i <= count; i++) {
        products.push({
            _id: `${i}`,
            name: `Product ${i}`,
            description: `Description ${i}`,
            slug: `product-${i}`,
        });
    }
    return { data: { products } };
}

let mockProducts

describe("Products Integration Test", () => {
    beforeAll(() => {
        global.matchMedia = jest.fn().mockImplementation((query) => ({
          media: query,
          addListener: jest.fn(),
          removeListener: jest.fn(),
        }));
      });

    beforeEach(() => {
        axios.get.mockImplementation((url) => {
          if (url.includes(`/api/v1/product/get-product`)) {
            return Promise.resolve(mockProducts);
          }
        });
      });

    test("renders product details correctly", async () => {
        mockProducts = generateMockProducts(3);

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
        
        // Check if loading the product details
        await waitFor(() => {
            expect(screen.getByText("Product 3", {exact: false})).toBeInTheDocument();
            expect(screen.getByText("Description 3", {exact: false})).toBeInTheDocument();
        }
    )})

    test("displays error message on API failure", async () => {
        mockProducts = generateMockProducts(0);

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
    
        await waitFor(() => {
          expect(screen.getByText("All Products List")).toBeInTheDocument();
          const product = screen.queryByText('Description 3')
          expect(product).not.toBeInTheDocument();
        });
    });

    test("displays error message on API failure", async () => {
        mockProducts = generateMockProducts(3);
        axios.get.mockRejectedValue(new Error("Network Error"));
        jest.spyOn(console, 'log').mockImplementation(() => {})

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
    
        await waitFor(() => {
          expect(screen.getByText("All Products List")).toBeInTheDocument();
          expect(screen.getByText("Something Went Wrong")).toBeInTheDocument();
        });
    });
})
