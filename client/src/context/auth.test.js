import React from "react";
import { useAuth, AuthProvider } from "./auth";
import { render, act, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

describe("Auth Context", () => {
	beforeEach(() => {
	jest.clearAllMocks();
	});

	describe("AuthProvider", () => {
	it("Should render the provider with children", async () => {
		await act(async () => render(<AuthProvider><div>Test</div></AuthProvider>));
		expect(screen.getByText("Test")).toBeInTheDocument();
	});

	it("Should retrieve from localStorage", async () => {
		localStorage.setItem("auth", JSON.stringify({
				user: {
					name: "Neale",
					role: "Admin"
				},
				token: "authToken"
			}));
		await act(async () => render(<AuthProvider><div>Test</div></AuthProvider>));
		expect(screen.getByText("Test")).toBeInTheDocument();
		localStorage.removeItem("auth");
	});
	});

	describe("useAuth", () => {
		it("Should return Auth and setAuth", async () => {
			// Setup
			localStorage.setItem("auth", JSON.stringify({
				user: {
					name: "Neale",
					role: "Admin"
				},
				token: "authToken"
			}));
			const TestComponent = () => {
				const [auth, setAuth] = useAuth();
				expect(setAuth).toBeInstanceOf(Function);
				return <div>
					<h1>Test</h1>
					<h2>{auth.user?.name}</h2>
					<h3>{auth.user?.role}</h3>
				</div>;
			};

			// Test
			await act(async () => render(<AuthProvider><TestComponent /></AuthProvider>));
			expect(screen.getByText("Test")).toBeInTheDocument();
			expect(screen.getByText("Neale")).toBeInTheDocument();
			expect(screen.getByText("Admin")).toBeInTheDocument();

			// Cleanup
			localStorage.removeItem("auth");
	});
	});
});