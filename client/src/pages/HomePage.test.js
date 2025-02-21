import React from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Layout from "./../components/Layout";
import "@testing-library/jest-dom/extend-expect";
import { render, fireEvent, waitFor , screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";

// Mocking axios.post
jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]), // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock("../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]), // Mock useCart hook to return null state and a mock function
}));

jest.mock("../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
}));

jest.mock("../hooks/useCategory", () => jest.fn(() => []));

describe("Test Home Page Render", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("Test Text Render", async () => {
        const { getByText } = render(
            <MemoryRouter initialEntries={["/HomePage"]}>
              <Routes>
                <Route path="/HomePage" element={<HomePage />} />
              </Routes>
            </MemoryRouter>
        );

        axios.get.mockResolvedValue({data: {products: [], total: 0}});

        expect(screen.getByText("Filter By Category")).toBeInTheDocument();
        // expect(getByText("Filter By Price")).toBeInTheDocument();
        // expect(getByText("RESET FILTERS")).toBeInTheDocument();
        // expect(getByText("All Products")).toBeInTheDocument();
    });

    // test("Filter should be empty initially", () => {
    //   const { getByText, getByPlaceholderText } = render(
    //     <MemoryRouter initialEntries={["/HomePage"]}>
    //       <Routes>
    //         <Route path="/HomePage" element={<HomePage />} />
    //       </Routes>
    //     </MemoryRouter>
    //   );
    //   /**
    //    * Find a way to check the checkboxes
    //    */
    //   axios.post.mockResolvedValue({ data: { total: 0 }});
    //   axios.get.mockResolvedValue({ data: { success: true, category: [] } });

    //   const radio_buttons = screen.getAllByRole("radio");

    //   radio_buttons.forEach((radio) => {
    //     expect(radio.checked).toBe(false);
    //   });
    // })
})