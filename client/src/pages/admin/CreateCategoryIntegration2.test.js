import React from "react";
import { render, waitFor, screen } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import CreateCategory from "./CreateCategory";
import { AuthProvider } from "../../context/auth";
import { CartProvider } from "../../context/cart";
import { SearchProvider } from "../../context/search";
import dotenv from "dotenv";

dotenv.config();
let authToken, mockAuth;

beforeAll(async () => {
  axios.defaults.baseURL = "http://localhost:6060";
  try {
    const loginResponse = await axios.post("/api/v1/auth/login", {
      email: process.env.TEST_ADMIN_USER,
      password: process.env.TEST_ADMIN_PASS,
    });
    authToken = loginResponse.data.token;
    axios.defaults.headers.common["Authorization"] = authToken;
    console.log(axios.defaults.headers.common["Authorization"]);
  } catch (error) {
    console.error(
      "Authentication failed:",
      error.response?.data || error.message
    );
  }
});
// This test is to check FE-BE integration
describe("Create Category Component", () => {
  it("should display all retrieved categories successfully", async () => {
    mockAuth = {
      user: {
        email: "john@example.com",
        name: "John Doe",
        phone: "90123456",
        address: "Test address",
      },
      token: 1,
    };
    localStorage.setItem("auth", JSON.stringify(mockAuth));
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

    await waitFor(
      () => {
        //retrieved elements are correct
        expect(
          screen.getByText("Electronics", { selector: "td" })
        ).toBeInTheDocument();
        expect(
          screen.getByText("Book", { selector: "td" })
        ).toBeInTheDocument();
        expect(
          screen.getByText("Clothing", { selector: "td" })
        ).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });
});
