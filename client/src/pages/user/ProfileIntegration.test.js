import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Profile from "./Profile"; 
import { AuthContext, AuthProvider } from "../../context/auth"; 
import axios from "axios";
import { MemoryRouter } from "react-router-dom";
import { CartProvider } from "../../context/cart";
import { SearchProvider } from "../../context/search";
import dotenv from "dotenv";

dotenv.config();
let authToken, mockAuth;

beforeAll(async () => {
  axios.defaults.baseURL = 'http://localhost:6060';
  try {
    const loginResponse = await axios.post('/api/v1/auth/login', {
      email: process.env.TEST_ADMIN_USER, 
      password: process.env.TEST_ADMIN_PASS    
    });
    authToken = loginResponse.data.token;
    axios.defaults.headers.common['Authorization'] = authToken;
    console.log("Profile Integration Test")
    console.log(axios.defaults.headers.common['Authorization']);
    console.log("Successfully authenticated with token");
  } catch (error) {
    console.error("Authentication failed:", error.response?.data || error.message);
  }

  mockAuth = {
    user: {
        email: "john@example.com", 
        name: "John Doe", 
        phone: "90123456", 
        address: "Test address"
    },
    token : 1
  };  
  
})


  describe("Profile Integration Test", () => {
    test("Profile page should render with correct initial values", () => {

        render(
          <AuthContext.Provider value={[mockAuth]}>
            <CartProvider>
              <SearchProvider>
                <MemoryRouter>
                    <Profile />
                </MemoryRouter>
              </SearchProvider>
            </CartProvider>
          </AuthContext.Provider>
          );


          expect(screen.getByPlaceholderText("Enter Your Name")).toHaveValue(mockAuth.user.name);
          expect(screen.getByPlaceholderText("Enter Your Email")).toHaveValue(mockAuth.user.email);
          expect(screen.getByPlaceholderText("Enter Your Phone")).toHaveValue(mockAuth.user.phone);
          expect(screen.getByPlaceholderText("Enter Your Address")).toHaveValue(mockAuth.user.address);
    });
    test("API called and auth state updated on form submit", async () => {


      const updatedUser = {
          email: "jane@example.com", 
          name: "Jane Doe", 
          password: process.env.TEST_NORMAL_PASS,
          phone: "98765432", 
          address: "Modified test address"
      }

      localStorage.setItem('auth', JSON.stringify(mockAuth));
      

      render(
        <AuthProvider>
          <CartProvider>
            <SearchProvider>
              <MemoryRouter>
                  <Profile />
              </MemoryRouter>
            </SearchProvider>
          </CartProvider>
        </AuthProvider>
        );

      await waitFor(() => {
        expect(screen.getByPlaceholderText("Enter Your Name")).toHaveValue(mockAuth.user.name);
      },);

      // email is disabled to be updated
      fireEvent.change(screen.getByPlaceholderText("Enter Your Name"), { target: { value: updatedUser.name } });
      fireEvent.change(screen.getByPlaceholderText("Enter Your Phone"), { target: { value: updatedUser.phone } });
      fireEvent.change(screen.getByPlaceholderText("Enter Your Address"), { target: { value: updatedUser.address } });
      fireEvent.change(screen.getByPlaceholderText("Enter Your Password"), { target: { value: updatedUser.password } });
  
      // update with new details
      fireEvent.click(screen.getByText("UPDATE"));

      await waitFor(() => {
        expect(screen.getByPlaceholderText("Enter Your Name")).toHaveValue(updatedUser.name);
        expect(screen.getByPlaceholderText("Enter Your Phone")).toHaveValue(updatedUser.phone);
        expect(screen.getByPlaceholderText("Enter Your Address")).toHaveValue(updatedUser.address);
      },);
  });
}
  )