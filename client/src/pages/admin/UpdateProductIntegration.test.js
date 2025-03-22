import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import axios from "axios";
import { CartProvider } from "../../context/cart";
import { AuthProvider } from "../../context/auth";
import { SearchProvider } from "../../context/search";
import UpdateProduct from "./UpdateProduct";
import mongoose from "mongoose";
import productModel from "../../../../models/productModel";
import categoryModel from "../../../../models/categoryModel";
import dotenv from "dotenv"
import { expect, jest } from "@jest/globals";
import { beforeEach } from "node:test";

dotenv.config();
axios.defaults.baseURL = 'http://localhost:6060';

let mockProduct, mockCategory

describe("UpdateProduct Integration Test", () => {

  const renderUpdateProduct = () => {
    return render(
      <AuthProvider>
        <CartProvider>
          <SearchProvider>
            <MemoryRouter initialEntries={["/dashboard/admin/product/update-mock-product"]}>
              <Routes>
                <Route path="/dashboard/admin/product/:slug" element={<UpdateProduct />} />
              </Routes>
            </MemoryRouter>
          </SearchProvider>
        </CartProvider>
      </AuthProvider>
    );
  }

  const mockCategoryParams = {
      _id: new mongoose.Types.ObjectId(),
      name: "Update Category",
      slug: "update-category"
    }
  
  const mockProductParams = {
    _id: new mongoose.Types.ObjectId(),
    name: "Update Mock Product",
    slug: "update-mock-product",
    description: "Update Mock Description",
    price: 100,
    quantity: 1,
    category: {}
  }

  const excludeId = ({ _id, ...rest }) => rest;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL);

    var options = { upsert: true, new: true, setDefaultsOnInsert: true }
    mockCategory = await categoryModel.findOneAndUpdate({name: mockCategoryParams.name}, excludeId(mockCategoryParams), options)
    mockProductParams.category = mockCategory

    mockProduct = await productModel.findOneAndUpdate({name: mockProductParams.name}, excludeId(mockProductParams), options)

    await new Promise((resolve) => setTimeout(resolve, 3000));

    global.matchMedia = jest.fn().mockImplementation((query) => ({
        media: query,
        addListener: jest.fn(),
        removeListener: jest.fn(),
    }));
  });

  // ensures that the product exists, in the specific circumstance where delete is tested first
  beforeEach(async () => {
    var options = { upsert: true, new: true, setDefaultsOnInsert: true }
    mockCategory = await categoryModel.findOneAndUpdate({name: mockCategoryParams.name}, excludeId(mockCategoryParams), options)
    mockProductParams.category = mockCategory

    mockProduct = await productModel.findOneAndUpdate({name: mockProductParams.name}, excludeId(mockProductParams), options)
    await new Promise((resolve) => setTimeout(resolve, 500));
  })

  afterAll(async () => {
    await mongoose.connection.close();
  })

  test("renders the product details correctly", async () => {
    renderUpdateProduct()

    await waitFor(() => {
      expect(screen.getByPlaceholderText("write a name")).toHaveValue("Update Mock Product")
    })
    expect(screen.getByPlaceholderText("write a description")).toHaveValue("Update Mock Description")
    expect(screen.getByPlaceholderText("write a Price")).toHaveValue(100)
    expect(screen.getByPlaceholderText("write a quantity")).toHaveValue(1)

    // tests the shipping input field
    await waitFor(() => {
      const selectElements = document.querySelectorAll(".ant-select-selection-item");
      const shippingSelectElement = selectElements[selectElements.length - 1];
      expect(shippingSelectElement.textContent).toBe("No")
    });
  })

  test("updates the product on form submission", async () => {
    const {rerender} = renderUpdateProduct()

    await waitFor(() => {
      expect(screen.getByPlaceholderText('write a name')).toHaveValue('Update Mock Product');
    })

    fireEvent.change(screen.getByPlaceholderText("write a Price"), {
      target: { value: '150' }
    });

    fireEvent.click(screen.getByText('UPDATE PRODUCT'))
    
    // No method given to verify successful updates
    await waitFor(() => {}, { timeout: 1000 })

    rerender(
      <AuthProvider>
        <CartProvider>
          <SearchProvider>
            <MemoryRouter initialEntries={["/dashboard/admin/product/update-mock-product"]}>
              <Routes>
                <Route path="/dashboard/admin/product/:slug" element={<UpdateProduct />} />
              </Routes>
            </MemoryRouter>
          </SearchProvider>
        </CartProvider>
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByPlaceholderText("write a name")).toHaveValue("Update Mock Product")
    })
    expect(screen.getByPlaceholderText("write a Price")).toHaveValue(150)
  });

  // used mongoose to test absence of product as did not want to the absence of rendered product
  test("deletes the product on delete button click", async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    renderUpdateProduct()

    await waitFor(() => {
      expect(screen.getByPlaceholderText('write a name')).toHaveValue('Update Mock Product');
    })

    // jest does not provide methods to interact with aa window prompt dialog
    window.prompt = jest.fn().mockReturnValue("Yes");
    fireEvent.click(screen.getByText("DELETE PRODUCT"));

    await waitFor(async () => {
      const expectedNull = await productModel.findById(mockProduct._id)
      expect(expectedNull).toBeNull()
    })
  });
})
