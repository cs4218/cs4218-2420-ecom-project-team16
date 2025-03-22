import React from "react";
import axios from "axios";
import "@testing-library/jest-dom/extend-expect";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import { AuthProvider } from "../context/auth";
import { CartProvider } from "../context/cart";
import { SearchProvider } from "../context/search";
import dotenv from "dotenv"
import useCategory from "../hooks/useCategory";

describe("Test Home Page Render", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        axios.defaults.baseURL = 'http://localhost:6060';
    });
    afterEach(() => {
        jest.clearAllMocks();
    })

    test("Basic Integration Text Render", async () => {
        render(
            <SearchProvider>
                <CartProvider>
                    <AuthProvider>
                        <MemoryRouter initialEntries={["/HomePage"]}>
                            <Routes>
                                <Route path="/HomePage" element={<HomePage />} />
                            </Routes>
                        </MemoryRouter>
                    </AuthProvider>
                </CartProvider>
            </SearchProvider>
        );

        expect(screen.getByText("Filter By Category")).toBeInTheDocument();
        expect(screen.getByText("Filter By Price")).toBeInTheDocument();
        expect(screen.getByText("RESET FILTERS")).toBeInTheDocument();
        expect(screen.getByText("All Products")).toBeInTheDocument();
    });

    test("Category filter updates state on selection", async () => {
        const postSpy = jest.spyOn(axios, 'post');
        const getSpy = jest.spyOn(axios, 'get');
        render(
            <SearchProvider>
                <CartProvider>
                    <AuthProvider>
                        <MemoryRouter initialEntries={["/HomePage"]}>
                            <Routes>
                                <Route path="/HomePage" element={<HomePage />} />
                            </Routes>
                        </MemoryRouter>
                    </AuthProvider>
                </CartProvider>
            </SearchProvider>
        );

        await waitFor(() => {
            expect(screen.getByText("Novel")).toBeInTheDocument();
        })
        const categoryCheckbox = await screen.findByLabelText("Electronics");
        fireEvent.click(categoryCheckbox);

        await waitFor(() => {
            expect(postSpy).toHaveBeenCalledWith(
                expect.stringContaining("/api/v1/product/product-filters"),
                expect.any(Object)
            );
            expect(getSpy).toHaveBeenCalled();
        });
        await screen.findByText("Novel");

        // Set a timeout to ensure that the UI can update before the waitFor
        await new Promise((resolve) => setTimeout(resolve, 3000));
        await waitFor(() => {
            expect(screen.queryByText("Novel")).toBeNull();
        });
    });

    test("Price filter updates state on selection", async () => {
        const postSpy = jest.spyOn(axios, 'post');
        const getSpy = jest.spyOn(axios, 'get');
        render(
            <SearchProvider>
                <CartProvider>
                    <AuthProvider>
                        <MemoryRouter initialEntries={["/HomePage"]}>
                            <Routes>
                                <Route path="/HomePage" element={<HomePage />} />
                            </Routes>
                        </MemoryRouter>
                    </AuthProvider>
                </CartProvider>
            </SearchProvider>
        );
        await screen.findByText("Smartphone");

        const radioButton = screen.getByLabelText("$0 to 19");

        fireEvent.click(radioButton);

        expect(radioButton).toBeChecked();

        await waitFor(() => {
            expect(postSpy).toHaveBeenCalledWith(
                expect.stringContaining("/api/v1/product/product-filters"),
                expect.any(Object)
            );
        });
        // Set a timeout to ensure that the UI can update before the waitFor
        await new Promise((resolve) => setTimeout(resolve, 3000));
        await waitFor(() => {
            expect(screen.queryByText("Smartphone")).toBeNull();
        });
    });
})