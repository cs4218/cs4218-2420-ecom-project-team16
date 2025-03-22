import React from "react";
import { render, waitFor, screen, fireEvent } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import CreateProduct from "./CreateProduct";
import { AuthProvider } from "../../context/auth";
import { CartProvider } from "../../context/cart";
import { SearchProvider } from "../../context/search";

jest.mock("axios");

describe("Create Product Component", () => {
  beforeAll(() => {
    global.matchMedia = jest.fn().mockImplementation((query) => ({
      media: query,
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }));
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });
  const mockCategories = [
    { _id: 1, name: "cat_1" },
    { _id: 2, name: "cat_2" },
    { _id: 3, name: "cat_3" },
    { _id: 4, name: "cat_4" },
  ];
  it("Renders the create product with mocked products", async () => {
    axios.get.mockResolvedValueOnce({
      data: { success: true, category: mockCategories },
    });

    render(
      <AuthProvider>
        <CartProvider>
          <SearchProvider>
            <MemoryRouter initialEntries={["/dashboard/admin/create-product"]}>
              <Routes>
                <Route
                  path="/dashboard/admin/create-product"
                  element={<CreateProduct />}
                />
              </Routes>
            </MemoryRouter>
          </SearchProvider>
        </CartProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
      //Admin Menu
      expect(screen.getByText("Admin Panel")).toBeInTheDocument();
      expect(screen.getByText("Create Category")).toBeInTheDocument();
      //   expect(screen.getByText("Create Product")).toBeInTheDocument();
      expect(screen.getByText("Products")).toBeInTheDocument();
      expect(screen.getByText("Orders")).toBeInTheDocument();

      // Other components
      expect(screen.getByText("Upload Photo")).toBeInTheDocument();
      expect(screen.getByText("Select Shipping")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("write a quantity")
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText("write a Price")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("write a description")
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText("write a name")).toBeInTheDocument();
      expect(screen.getByText("Select a category")).toBeInTheDocument();
      expect(screen.getByText("CREATE PRODUCT")).toBeInTheDocument();

      //Layout Component
      expect(screen.getByText(/All Rights Reserved/)).toBeInTheDocument();
      expect(screen.getByText("About")).toBeInTheDocument();
      expect(screen.getByText("Contact")).toBeInTheDocument();
      expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
    });
  });
  it("toast error if retrieval results in error", async () => {
    const error = new Error("Mocked Error");
    await axios.get.mockRejectedValue(error);
    render(
      <AuthProvider>
        <CartProvider>
          <SearchProvider>
            <MemoryRouter initialEntries={["/dashboard/admin/create-product"]}>
              <Routes>
                <Route
                  path="/dashboard/admin/create-product"
                  element={<CreateProduct />}
                />
              </Routes>
            </MemoryRouter>
          </SearchProvider>
        </CartProvider>
      </AuthProvider>
    );
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
      //toast integration
      expect(
        screen.getByText("Something went wrong in getting catgeory")
      ).toBeInTheDocument();
    });
  });
});
