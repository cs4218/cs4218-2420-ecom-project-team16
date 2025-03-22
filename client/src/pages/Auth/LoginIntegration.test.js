import React, { useState } from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import toast, { Toaster } from "react-hot-toast";
import Login from "./Login";
import { AuthProvider } from "../../context/auth";
import { CartProvider } from "../../context/cart";
import { SearchProvider } from "../../context/search";
import dotenv from "dotenv"
import HomePage from "../HomePage";
import useCategory from "../../hooks/useCategory";

dotenv.config();

window.matchMedia =
    window.matchMedia ||
    function () {
        return {
            matches: false,
            addListener: function () { },
            removeListener: function () { },
        };
    };

describe("Test Integration Login Page", () => {
    beforeAll(() => {
        axios.defaults.baseURL = 'http://localhost:6060';
    })
    beforeEach(() => {
        jest.clearAllMocks();
    })
    test("Test that all providers can run without issues", () => {
        const { getByText, getByPlaceholderText } = render(
            <SearchProvider>
                <CartProvider>
                    <AuthProvider>
                        <MemoryRouter initialEntries={["/login"]}>
                            <Routes>
                                <Route path="/login" element={<Login />} />
                            </Routes>
                        </MemoryRouter>
                    </AuthProvider>
                </CartProvider>
            </SearchProvider>
        );

        expect(getByText("LOGIN FORM")).toBeInTheDocument();
        expect(getByPlaceholderText("Enter Your Email").value).toBe("");
        expect(getByPlaceholderText("Enter Your Password").value).toBe("");
    });

    test("Unable to login with no credentials", async () => {
        const { getByText, getByPlaceholderText } = render(
            <SearchProvider>
                <CartProvider>
                    <AuthProvider>
                        <MemoryRouter initialEntries={["/login"]}>
                            <Routes>
                                <Route path="/login" element={<Login />} />
                            </Routes>
                        </MemoryRouter>
                    </AuthProvider>
                </CartProvider>
            </SearchProvider>
        );
        fireEvent.click(getByText("LOGIN"));
        await waitFor(() => {
            // Check that redirect failed
            expect(getByText("LOGIN")).toBeInTheDocument()
        });
    });

    test("Login the user successfully", async () => {
        const postSpy = jest.spyOn(axios, "post");
        const toastSpy = jest.spyOn(toast, 'success');
        const { getByPlaceholderText, getByText } = render(
            <SearchProvider>
                <CartProvider>
                    <AuthProvider>
                        <MemoryRouter initialEntries={["/login"]}>
                            <Routes>
                                <Route path="/login" element={<Login />} />
                                <Route path="/" element={<HomePage />} />
                            </Routes>
                        </MemoryRouter>
                    </AuthProvider>
                </CartProvider>
            </SearchProvider>
        );

        fireEvent.change(getByPlaceholderText("Enter Your Email"), {
            target: { value: "cs4218@test.com" },
        });
        fireEvent.change(getByPlaceholderText("Enter Your Password"), {
            target: { value: "cs4218@test.com" },
        });
        fireEvent.click(getByText("LOGIN"));

        await waitFor(() => expect(postSpy).toHaveBeenCalled());
        await waitFor(() => {
            expect(getByText("Filter By Category")).toBeInTheDocument();
            expect(getByText("Filter By Price")).toBeInTheDocument();
        }, { timeout: 10000 });
        await waitFor(() => {
            expect(toastSpy).toHaveBeenCalledWith("login successfully", {
                duration: 5000,
                icon: "🙏",
                style: {
                    background: "green",
                    color: "white",
                },
            });
        });
    });

    test("Unable to Login with wrong credentials", async () => {
        const postSpy = jest.spyOn(axios, "post")
        const toastSpy = jest.spyOn(toast, 'error');
        const { getByPlaceholderText, getByText } = render(
            <SearchProvider>
                <CartProvider>
                    <AuthProvider>
                        <MemoryRouter initialEntries={["/login"]}>
                            <Routes>
                                <Route path="/login" element={<Login />} />
                                <Route path="/" element={<HomePage />} />
                            </Routes>
                        </MemoryRouter>
                    </AuthProvider>
                </CartProvider>
            </SearchProvider>
        );

        fireEvent.change(getByPlaceholderText("Enter Your Email"), {
            target: { value: "nothing@example.com" },
        });
        fireEvent.change(getByPlaceholderText("Enter Your Password"), {
            target: { value: "password123" },
        });
        fireEvent.click(getByText("LOGIN"));

        await waitFor(() => expect(postSpy).toHaveBeenCalled());
        await waitFor(() => {
            expect(toastSpy).toHaveBeenCalledWith("Something went wrong");
        }, {timeout: 10000});
    });
});