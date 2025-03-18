import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import axios from "axios";
import { CartProvider } from "../../context/cart";
import { AuthProvider } from "../../context/auth";
import { SearchProvider } from "../../context/search";
import UpdateProduct from "./UpdateProduct";

jest.mock("axios");

const mockProduct = {
  product: {
    _id: "123",
    name: "Test Product",
    slug: 'test-product',
    description: "Test Description",
    price: 100,
    quantity: 10,
    shipping: "1",
    category: { _id: "cat123", name: "Test Category" },
  },
};

const mockCategories = {
  success: true,
  category: [{ _id: "cat123", name: "Test Category" }],
};

describe("UpdateProduct Integration Test", () => {
  beforeEach(async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes("get-product")) {
        return Promise.resolve({ data: mockProduct });
      }
      if (url.includes("get-category")) {
        return Promise.resolve({ data: mockCategories });
      }
    });
  });

  beforeAll(() => {
    global.matchMedia = jest.fn().mockImplementation((query) => ({
        media: query,
        addListener: jest.fn(),
        removeListener: jest.fn(),
    }));
  });

  test("renders the product details correctly", async () => {
    render(
        <AuthProvider>
          <CartProvider>
            <SearchProvider>
              <MemoryRouter initialEntries={["/dashboard/admin/product/test-product"]}>
                <Routes>
                  <Route path="/dashboard/admin/product/test-product" element={<UpdateProduct />} />
                </Routes>
              </MemoryRouter>
            </SearchProvider>
          </CartProvider>
        </AuthProvider>
      );
    
    await waitFor(() => {
        expect(screen.getByDisplayValue("Test Product")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Test Description")).toBeInTheDocument();
        expect(screen.getByDisplayValue("100")).toBeInTheDocument();
        expect(screen.getByDisplayValue("10")).toBeInTheDocument();
    })
    
  });

  test("updates the product on form submission", async () => {
    axios.put.mockResolvedValue({ data: { success: true, message: "Updated" } });

    render(
        <AuthProvider>
          <CartProvider>
            <SearchProvider>
              <MemoryRouter initialEntries={["/dashboard/admin/product/test-product"]}>
                <Routes>
                  <Route path="/dashboard/admin/product/test-product" element={<UpdateProduct />} />
                </Routes>
              </MemoryRouter>
            </SearchProvider>
          </CartProvider>
        </AuthProvider>
      );
    
    await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("write a name"), {
            target: { value: "Updated Product" },
        });
      
        fireEvent.click(screen.getByText("UPDATE PRODUCT"));
    })
    

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        expect.stringContaining("update-product/"),
        expect.any(FormData)
      );
    });
  });

  test("deletes the product on delete button click", async () => {
    axios.delete.mockResolvedValue({ data: { success: true } });

    render(
        <AuthProvider>
          <CartProvider>
            <SearchProvider>
              <MemoryRouter initialEntries={["/dashboard/admin/product/test-product"]}>
                <Routes>
                  <Route path="/dashboard/admin/product/test-product" element={<UpdateProduct />} />
                </Routes>
              </MemoryRouter>
            </SearchProvider>
          </CartProvider>
        </AuthProvider>
      );


    await waitFor(() => {
        window.prompt = jest.fn().mockReturnValue("Yes");
        fireEvent.click(screen.getByText("DELETE PRODUCT"));
    })

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        expect.stringContaining("delete-product/")
      );
    });
  });
});
