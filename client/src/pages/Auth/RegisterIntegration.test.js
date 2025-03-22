import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import toast from "react-hot-toast";
import Register from "./Register";
import { AuthProvider } from "../../context/auth";
import { CartProvider } from "../../context/cart";
import { SearchProvider } from "../../context/search";
import dotenv from "dotenv"
import useCategory from "../../hooks/useCategory";
import Login from "./Login";

// import { MongoMemoryServer } from "mongodb-memory-server";
// import mongoose from "mongoose";
// import userModel from "../../../../models/userModel";

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

describe("Register Component", () => {
    let mongoServer
    beforeAll(async () => {
        axios.defaults.baseURL = 'http://localhost:6060';
    });
    beforeEach(async () => {
        jest.clearAllMocks();
    });

    /**
     * Note that this test case can only be run once on a fresh DB
     * Or manually delete from DB after.
     */
    // test("Should register the user successfully", async () => {
    //     const postSpy = jest.spyOn(axios, 'post')
    //     const toastSpy = jest.spyOn(toast, 'success');
    //     const { getByText, getByPlaceholderText } = render(
    //         <SearchProvider>
    //             <CartProvider>
    //                 <AuthProvider>
    //                     <MemoryRouter initialEntries={["/register"]}>
    //                         <Routes>
    //                             <Route path="/register" element={<Register />} />
    //                             <Route path="/login" element={<Login />} />
    //                         </Routes>
    //                     </MemoryRouter>
    //                 </AuthProvider>
    //             </CartProvider>
    //         </SearchProvider>
    //     );

    //     fireEvent.change(getByPlaceholderText("Enter Your Name"), {
    //         target: { value: "John Doe" },
    //     });
    //     fireEvent.change(getByPlaceholderText("Enter Your Email"), {
    //         target: { value: "anotherSomething@test.com" },
    //     });
    //     fireEvent.change(getByPlaceholderText("Enter Your Password"), {
    //         target: { value: "Password123" },
    //     });
    //     fireEvent.change(getByPlaceholderText("Enter Your Phone"), {
    //         target: { value: "1234567890" },
    //     });
    //     fireEvent.change(getByPlaceholderText("Enter Your Address"), {
    //         target: { value: "123 Street" },
    //     });
    //     fireEvent.change(getByPlaceholderText("Enter Your DOB"), {
    //         target: { value: "2000-01-01" },
    //     });
    //     fireEvent.change(getByPlaceholderText("What is Your Favorite sports"), {
    //         target: { value: "Football" },
    //     });

    //     fireEvent.click(getByText("REGISTER"));

    //     await waitFor(() => expect(postSpy).toHaveBeenCalled());
    //     await waitFor(() => {
    //         expect(getByText("LOGIN FORM")).toBeInTheDocument();
    //         expect(getByPlaceholderText("Enter Your Email").value).toBe("");
    //         expect(getByPlaceholderText("Enter Your Password").value).toBe("");
    //     });
    //     await waitFor(() => {
    //         expect(toastSpy).toHaveBeenCalledWith(
    //             "Register Successfully, please login"
    //         );
    //     })
    // }, 10000);

    test("should display error message on failed registration", async () => {
        const postSpy = jest.spyOn(axios, 'post')
        const toastSpy = jest.spyOn(toast, 'error');
        const { getByText, getByPlaceholderText } = render(
            <SearchProvider>
                <CartProvider>
                    <AuthProvider>
                        <MemoryRouter initialEntries={["/register"]}>
                            <Routes>
                                <Route path="/register" element={<Register />} />
                            </Routes>
                        </MemoryRouter>
                    </AuthProvider>
                </CartProvider>
            </SearchProvider>
        );

        fireEvent.change(getByPlaceholderText("Enter Your Name"), {
            target: { value: "John Doe" },
        });
        fireEvent.change(getByPlaceholderText("Enter Your Email"), {
            target: { value: "cs4218@test.com" },
        });
        fireEvent.change(getByPlaceholderText("Enter Your Password"), {
            target: { value: "cs4218@test.com" },
        });
        fireEvent.change(getByPlaceholderText("Enter Your Phone"), {
            target: { value: "1234567890" },
        });
        fireEvent.change(getByPlaceholderText("Enter Your Address"), {
            target: { value: "123 Street" },
        });
        fireEvent.change(getByPlaceholderText("Enter Your DOB"), {
            target: { value: "2000-01-01" },
        });
        fireEvent.change(getByPlaceholderText("What is Your Favorite sports"), {
            target: { value: "Football" },
        });

        fireEvent.click(getByText("REGISTER"));

        await waitFor(() => expect(postSpy).toHaveBeenCalled());
        await waitFor(() => { expect(toastSpy).toHaveBeenCalledWith("Already Register please login") });
    });
});
