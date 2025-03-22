import React, { useState, useEffect } from "react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { render, waitFor, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import axios from "axios";
import CategoryProduct from "./CategoryProduct";
import { AuthProvider } from "../context/auth";
import { CartProvider } from "../context/cart";
import { SearchProvider } from "../context/search";

describe("Test Basic Render", () => {
    // Test with the default Database from canvas
    beforeAll(async () => {
        axios.defaults.baseURL = 'http://localhost:6060';
    });
    beforeEach(async () => {
        jest.clearAllMocks();
    });

    test("Test Book Category Loads Correctly", async () => {
        const getSpy = jest.spyOn(axios, 'get');
        render(
            <SearchProvider>
                <CartProvider>
                    <AuthProvider>
                        <MemoryRouter initialEntries={["/category/book"]}>
                            <Routes>
                                <Route path="/category/:slug" element={<CategoryProduct />} />
                            </Routes>
                        </MemoryRouter>
                    </AuthProvider>
                </CartProvider>
            </SearchProvider>
        );

        await waitFor(() => {
            expect(getSpy).toHaveBeenCalled();
        })
        
        await new Promise((resolve) => setTimeout(resolve, 3000));
        await waitFor(() => {
            expect(screen.getByText("Category - Book")).toBeInTheDocument();
            expect(screen.getByText("3 result found")).toBeInTheDocument();
        })
    });
})