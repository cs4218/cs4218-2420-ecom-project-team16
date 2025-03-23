import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CartPage from "./CartPage";
import { CartProvider } from "../context/cart";
import { AuthProvider } from "../context/auth";
import { SearchProvider } from "../context/search";
import dotenv from "dotenv";

dotenv.config();

const mockAuth = { user : {
    name : "Hong Shan",
    email : "hongshan@email.com",
    address: "Redhill",
    role : 1
}}

const mockCart = [
    {
        _id: "67a2171ea6d9e00ef2ac0229",
        name: "The Law of Contract in Singapore",
        description: "A bestselling book in Singapore",
        price: 54.99
    },
    {
        _id: "67a21772a6d9e00ef2ac022a",
        name: "NUS T-shirt",
        description: "Plain NUS T-shirt for sale",
        price: 4.99
    },
]

describe("Cart Page Integration Test", () => {
    test("Should render admin dashboard with related components", async() => {
        localStorage.setItem('cart', JSON.stringify(mockCart));

        render(
            <AuthProvider value={[mockAuth]}>
                <CartProvider>
                    <SearchProvider>
                        <MemoryRouter>
                            <CartPage />
                        </MemoryRouter>
                    </SearchProvider>
                </CartProvider>
            </AuthProvider>
        );
        
        // cart
        expect(screen.getByText("Cart")).toBeInTheDocument();
        expect(screen.getByText("The Law of Contract in Singapore")).toBeInTheDocument();
        expect(screen.getByText("NUS T-shirt")).toBeInTheDocument();
        expect(screen.getByText("Total: $59.98")).toBeInTheDocument();
        localStorage.removeItem('cart');
    })

    test("Should render correct user details", () => {
        localStorage.setItem('auth', JSON.stringify(mockAuth));

        render(
            <AuthProvider value={[mockAuth]}>
                <CartProvider>
                    <SearchProvider>
                        <MemoryRouter>
                            <CartPage />
                        </MemoryRouter>
                    </SearchProvider>
                </CartProvider>
            </AuthProvider>
        );

        expect(screen.getByText("Hong Shan")).toBeInTheDocument();
        expect(screen.getByText("Redhill")).toBeInTheDocument();
        expect(screen.getByText("Update Address")).toBeInTheDocument();
        localStorage.removeItem('auth');
    });

    test("Should render correct user details without address", () => {
        const mockAuthWithoutAddress = {
            user: {
                name: "Hong Shan",
                email: "hongshan@gmail.com",
                role: 1,
            },
            token: "mockToken"
        };
        localStorage.setItem('auth', JSON.stringify(mockAuthWithoutAddress));

        render(
            <AuthProvider value={[mockAuthWithoutAddress]}>
                <CartProvider>
                    <SearchProvider>
                        <MemoryRouter>
                            <CartPage />
                        </MemoryRouter>
                    </SearchProvider>
                </CartProvider>
            </AuthProvider>
        );

        expect(screen.getByText("Hong Shan")).toBeInTheDocument();
        expect(screen.queryByText("Redhill")).toBeNull();
        expect(screen.getByText("Update Address")).toBeInTheDocument();
        localStorage.removeItem('auth');
    });

    test("Should render login button when user is not authenticated", () => {
        render(
            <AuthProvider>
                <CartProvider>
                    <SearchProvider>
                        <MemoryRouter>
                            <CartPage />
                        </MemoryRouter>
                    </SearchProvider>
                </CartProvider>
            </AuthProvider>
        );

        expect(screen.getByText("Please Login to checkout")).toBeInTheDocument();
    });

    test("Should remove item from cart", () => {
        localStorage.setItem('cart', JSON.stringify(mockCart));

        render(
            <AuthProvider value={[mockAuth]}>
                <CartProvider>
                    <SearchProvider>
                        <MemoryRouter>
                            <CartPage />
                        </MemoryRouter>
                    </SearchProvider>
                </CartProvider>
            </AuthProvider>
        );

        const removeButton = screen.getAllByText("Remove")[0];
        expect(removeButton).toBeInTheDocument();

        removeButton.click();

        // check local storage
        const cart = JSON.parse(localStorage.getItem('cart'));
        expect(cart).toEqual([mockCart[1]]);
        localStorage.removeItem('cart');
    });
});