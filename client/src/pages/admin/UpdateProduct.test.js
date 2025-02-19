import "@testing-library/react";
import '@testing-library/jest-dom';
import React from "react"
import { MemoryRouter } from "react-router-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import UpdateProduct from "./UpdateProduct";
import axios from "axios";
import toast from "react-hot-toast";

jest.mock("axios")

jest.mock("../../components/Layout", () => ({ children }) => <div>{ children }</div>);
jest.mock("../../components/AdminMenu", () => () => <div>Mock Admin Menu</div>);

jest.mock("react-hot-toast", () => ({
    success: jest.fn(),
    error: jest.fn()
}))

const mockNavigate = jest.fn()
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
    useParams: () => ({ slug: "test-product" }),
}));

const mockProduct = {
    success: true,
    product: {
        _id: "1",
        name: "Test Product",
        description: "Test Description",
        price: 99.99,
        quantity: 10,
        shipping: "1",
        category: {_id: "1", name: "category_1"}
    }
}

const mockCategories = {
    success: true,
    category: [{_id: '1', name: 'category_1'}, {_id: '2', name: 'category_2'}]
}

describe("UpdateProduct", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    })

    test("renders the product successfully", async () => {
        axios.get.mockResolvedValueOnce({ data: mockProduct })
        axios.get.mockResolvedValueOnce({ data: mockCategories })

        render(
            <MemoryRouter>
                <UpdateProduct/>
            </MemoryRouter>
        )

        await waitFor(() => {
            expect(screen.getByDisplayValue("Test Product")).toBeInTheDocument();
            expect(screen.getByDisplayValue("Test Description")).toBeInTheDocument();
            expect(screen.getByDisplayValue("99.99")).toBeInTheDocument();
            expect(screen.getByDisplayValue("10")).toBeInTheDocument();
        })

        expect(screen.getByText("Update Product")).toBeInTheDocument();
    })

    test("updates the product successfully", async () => {
        axios.get.mockResolvedValueOnce({ data: mockProduct })
        axios.get.mockResolvedValueOnce({ data: mockCategories })
        axios.put.mockResolvedValueOnce({ data: { success: true }})

        render(
            <MemoryRouter>
                <UpdateProduct/>
            </MemoryRouter>
        )

        await waitFor(() => screen.getByDisplayValue("Test Product"));

        fireEvent.change(screen.getByPlaceholderText("write a name"), {
            target: { value: "Updated Product" },
        });

        fireEvent.click(screen.getByText("UPDATE PRODUCT"));

        await waitFor(() => {
            expect(axios.put).toHaveBeenCalledWith(
              "/api/v1/product/update-product/1",
              expect.any(FormData)
            );
            expect(toast.success).toHaveBeenCalledWith("Product Updated Successfully");
            expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/products");
        });
    })

    test("deletes the product successfully", async () => {
        axios.get.mockResolvedValueOnce({ data: mockProduct })
        axios.get.mockResolvedValueOnce({ data: mockCategories })
        axios.delete.mockResolvedValueOnce({ data: { success: true } });

        render(
            <MemoryRouter>
                <UpdateProduct/>
            </MemoryRouter>
        )

        await waitFor(() => screen.getByDisplayValue("Test Product"));

        window.prompt = jest.fn(() => "Yes");

        fireEvent.click(screen.getByText("DELETE PRODUCT"));

        await waitFor(() => {
        expect(axios.delete).toHaveBeenCalledWith(
            "/api/v1/product/delete-product/1"
        );
        expect(toast.success).toHaveBeenCalledWith("Product DEleted Succfully");
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/products");
        });
    })

    test("handles API error in getting product gracefully", async () => {
        axios.get.mockRejectedValueOnce(new Error("Database error in getting product"));
        jest.spyOn(console, 'log')

        render(
            <MemoryRouter>
                <UpdateProduct/>
            </MemoryRouter>
        )

        await waitFor(() => {
            expect(console.log).toHaveBeenCalledWith(expect.any(Error)); // Check if error is logged
        });
    })

    test("handles API error in getting categories gracefully", async () => {
        axios.get.mockResolvedValueOnce({ data: mockProduct });
        axios.get.mockRejectedValueOnce(new Error("Database error in getting categories"));
        jest.spyOn(console, 'log')

        render(
            <MemoryRouter>
                <UpdateProduct/>
            </MemoryRouter>
        )

        await waitFor(() => {
            expect(console.log).toHaveBeenCalledWith(expect.any(Error)); // Check if error is logged
            expect(toast.error).toHaveBeenCalledWith("Something wwent wrong in getting catgeory")
        });
    })
})
