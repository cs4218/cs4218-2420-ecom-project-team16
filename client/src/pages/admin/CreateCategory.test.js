import React from "react";
import { render, waitFor, screen } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import CreateCategory from "./CreateCategory";

// Mock axios
jest.mock("axios");

jest.mock("./../../components/Layout", () => ({ children }) => {
  return (
    <>
      <h1>Mock Layout</h1>
      {children}
    </>
  );
});
jest.mock("./../../components/AdminMenu", () => () => {
  return <>Mock Admin Menu</>;
});
jest.mock("../../components/Form/CategoryForm", () => () => {
  return <>Mock Category Form</>;
});

describe("Create Category Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  const mockCategories = [
    { _id: 1, name: "cat_1" },
    { _id: 2, name: "cat_2" },
    { _id: 3, name: "cat_3" },
    { _id: 4, name: "cat_4" },
  ];
  it("should create the category successfully", async () => {
    await axios.get.mockResolvedValueOnce({
      data: { success: true, category: mockCategories },
    });

    render(
      <MemoryRouter initialEntries={["/dashboard/admin/create-category"]}>
        <Routes>
          <Route
            path="/dashboard/admin/create-category"
            element={<CreateCategory />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/category/get-category");
      expect(screen.getByText("cat_1")).toBeInTheDocument();
      expect(screen.getByText("cat_2")).toBeInTheDocument();
      expect(screen.getByText("cat_3")).toBeInTheDocument();
      expect(screen.getByText("cat_4")).toBeInTheDocument();
      expect(screen.getByText("Mock Layout")).toBeInTheDocument();
      expect(screen.getByText("Mock Admin Menu")).toBeInTheDocument();
      expect(screen.getByText("Mock Category Form")).toBeInTheDocument();
    });
  });
});
