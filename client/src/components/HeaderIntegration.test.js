import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Header from "./Header";
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
    test("Should render correct name", async() => {
        localStorage.setItem('auth', JSON.stringify(mockAuth));

        render(
            <AuthProvider value={[mockAuth]}>
                <CartProvider>
                    <SearchProvider>
                        <MemoryRouter>
                            <Header/>
                        </MemoryRouter>
                    </SearchProvider>
                </CartProvider>
            </AuthProvider>
        );
        
        // cart
        expect(screen.getByText("Hong Shan")).toBeInTheDocument();
    });

    test("Should render correct number of cart items", async() => {
        localStorage.setItem('cart', JSON.stringify(mockCart));

        render(
            <AuthProvider value={[mockAuth]}>
                <CartProvider>
                    <SearchProvider>
                        <MemoryRouter>
                            <Header/>
                        </MemoryRouter>
                    </SearchProvider>
                </CartProvider>
            </AuthProvider>
        );
        
        // cart count is in sup
        expect(screen.getByText("2")).toBeInTheDocument();
    });
});