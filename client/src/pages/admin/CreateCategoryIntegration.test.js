import React from "react";
import { render, waitFor, screen } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import CreateCategory from "./CreateCategory";
import { AuthProvider } from "../../context/auth";
import { CartProvider } from "../../context/cart";
import { SearchProvider } from "../../context/search";

// Mock axios
jest.mock("axios");

describe("Create Category Component", () => {
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
  it("should display all retrieved categories successfully", async () => {
    await axios.get.mockResolvedValueOnce({
      data: { success: true, category: mockCategories },
    });

    render(
      <AuthProvider>
        <CartProvider>
          <SearchProvider>
            <MemoryRouter initialEntries={["/dashboard/admin/create-category"]}>
              <Routes>
                <Route
                  path="/dashboard/admin/create-category"
                  element={<CreateCategory />}
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
      expect(screen.getByText("Create Product")).toBeInTheDocument();
      expect(screen.getByText("Products")).toBeInTheDocument();
      expect(screen.getByText("Orders")).toBeInTheDocument();
      //Layout Component
      expect(screen.getByText(/All Rights Reserved/)).toBeInTheDocument();
      expect(screen.getByText("About")).toBeInTheDocument();
      expect(screen.getByText("Contact")).toBeInTheDocument();
      expect(screen.getByText("Privacy Policy")).toBeInTheDocument();

      //remaining elements
      expect(screen.getByText("cat_1")).toBeInTheDocument();
      expect(screen.getByText("cat_2")).toBeInTheDocument();
      expect(screen.getByText("cat_3")).toBeInTheDocument();
      expect(screen.getByText("cat_4")).toBeInTheDocument();
    });
  });
  it("toast error if retrieval results in error", async () => {
    const error = new Error("Mocked Error");
    await axios.get.mockRejectedValue(error);
    render(
      <AuthProvider>
        <CartProvider>
          <SearchProvider>
            <MemoryRouter initialEntries={["/dashboard/admin/create-category"]}>
              <Routes>
                <Route
                  path="/dashboard/admin/create-category"
                  element={<CreateCategory />}
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
