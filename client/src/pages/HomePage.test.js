import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import HomePage from "./HomePage";
import axios from "axios";

jest.mock("axios");

jest.mock("react-router-dom", () => ({
    useNavigate: jest.fn(),
  }));

jest.mock("react-icons/ai", () => ({
    AiOutlineReload: () => <span data-testid="ai-outline-reload" />,
  }));

jest.mock("antd", () => ({
    Checkbox: ({ children, onChange }) => <div data-testid="checkbox" onChange={onChange}>{children}</div>,
    Radio: Object.assign(({ children }) => <div data-testid="radio-children">{children}</div>, {
      Group: ({ children, onChange }) => <div data-testid="radio-group" onChange={onChange}>{children}</div>,
      }),
  }));

jest.mock("react-hot-toast", () => ({
    error: jest.fn(),
    success: jest.fn(),
}));

jest.mock("../components/Layout", () => ({ title, children }) => (
    <div data-testid="layout-test" data-title={title}>
      {children}
    </div>
  ));

jest.mock("../context/cart", () => ({
    useCart: jest.fn(() => [[], jest.fn()]),
  }));


const mockCategories = {
    data: {
      success: true,
      category: [
        { _id: "cat1", name: "Electronics" },
        { _id: "cat2", name: "Clothing" },
      ],
    },
  };

const mockProducts = {
    data: {
      products: [
        { _id: "prod1", name: "Laptop", price: 999, description: "A great laptop", slug: "laptop" },
        { _id: "prod2", name: "T-Shirt", price: 20, description: "A cool t-shirt", slug: "t-shirt" },
      ],
    },
  };

const mockFilteredProducts = {
    data: {
      products: [
        { _id: "prod1", name: "Laptop", price: 999, description: "A great laptop", slug: "laptop" },
      ],
    },
  };

axios.get.mockImplementation((url) => {
  if (url.includes("get-category")) return Promise.resolve(mockCategories);
  if (url.includes("product-list")) return Promise.resolve(mockProducts);
  if (url.includes("product-count")) return Promise.resolve({ data: { total: 2 } });
});
axios.post.mockResolvedValue(mockFilteredProducts);

jest.mock("../components/Prices", () => ({
    Prices: [
      { _id: 1, name: "Below $50", array: [0, 50] },
      { _id: 2, name: "$50 - $100", array: [50, 100] },
    ]
  }));

describe("HomePage Page Static Components", () => {
    test("renders the Layout component with title", async () => {
      await act(async () => render(<HomePage />));
      const layout = screen.getByTestId("layout-test");
      expect(layout).toBeInTheDocument();
      expect(layout.getAttribute("data-title")).toMatch(/products/gi);
    });

    test("displays banner image with correct alt text", async () => {
      await act(async () => render(<HomePage />));
      const img = screen.getByAltText("bannerimage");
      expect(img).toBeInTheDocument();
      expect(img.getAttribute("src")).toMatch(/virtual/gi);
    });
    
    test("displays the correct filter headings", async () => {
      await act(async () => render(<HomePage />));
      const categoryHeading = screen.getByText("Filter By Category");
      expect(categoryHeading).toBeInTheDocument();
      const priceHeading = screen.getByText("Filter By Price");
      expect(priceHeading).toBeInTheDocument();
    });
  });

describe("HomePage Page Price", () => {
    test("displays the correct number of price ranges", async () => {
      await act(async () => render(<HomePage />));
      const prices = screen.getAllByTestId("radio-children");
      expect(prices).toHaveLength(2);
    });
  }
);

describe("HomePage Category Filter", () => {
  test("gets the correct categories", async () => {
    await act(async () => render(<HomePage />));

    // Wait for categories to be displayed
    await waitFor(() => expect(screen.getByText("Electronics")).toBeInTheDocument());

    // Check that categories are rendered
    const categoryCheckbox = screen.getByText("Clothing");
    expect(categoryCheckbox).toBeInTheDocument();
    const categories = screen.getAllByTestId("checkbox");
    expect(categories).toHaveLength(2);
  });
});

