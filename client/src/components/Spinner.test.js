import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import Spinner from "./Spinner";
import { afterEach } from "node:test";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: "/some-location" }),
}));

describe("Spinner Component", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it("Should render the Spinner component text", () => {
    render(<Router><Spinner/></Router>);
    expect(screen.getByText(/Redirecting you in 3 seconds/i)).toBeInTheDocument();
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  it("should display countdown and decrement each second", async () => {
    jest.useFakeTimers();
    render(<Router><Spinner/></Router>);

    expect(screen.getByText("Redirecting you in 3 seconds")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    await waitFor(() =>
      expect(screen.getByText((content) => content.includes("Redirecting you in 2 seconds"))).toBeInTheDocument()
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    await waitFor(() =>
      expect(screen.getByText((content) => content.includes("Redirecting you in 1 second"))).toBeInTheDocument()
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });
  });
});