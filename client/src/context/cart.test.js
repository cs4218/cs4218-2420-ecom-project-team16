import React from "react";
import { useCart, CartProvider } from "./cart";
import { render, act, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

describe("Cart Context", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("CartProvider", () => {
		it("Should render the provider with children", async () => {
			await act(async () => render(<CartProvider><div>Test</div></CartProvider>));
			expect(screen.getByText("Test")).toBeInTheDocument();
		});

		it("Should retrieve from localStorage", async () => {
			localStorage.setItem("cart", JSON.stringify([{ name: "Test" }]));
			await act(async () => render(<CartProvider><div>Test</div></CartProvider>));
			expect(screen.getByText("Test")).toBeInTheDocument();
			localStorage.removeItem("cart");
		});
	});

	describe("useCart", () => {
		it("Should return cart and setCart", async () => {
			// Setup
			localStorage.setItem("cart", JSON.stringify([
				{ name: "Paper" },
				{ name: "Pencil" },
			]));
			const TestComponent = () => {
				const [cart, setCart] = useCart();
				expect(setCart).toBeInstanceOf(Function);
				return <div>
					<h1>Test</h1>
					{cart?.map((item, index) => (
						<div key={index} data-testid={item.name}>{item.name}</div>
					))}
				</div>;
			};

			// Test
			await act(async () => render(<CartProvider><TestComponent /></CartProvider>));
			expect(screen.getByText("Test")).toBeInTheDocument();
			expect(screen.getByTestId("Paper")).toBeInTheDocument();
			expect(screen.getByTestId("Pencil")).toBeInTheDocument();

			// Cleanup
			localStorage.removeItem("cart");
		});
	});
});