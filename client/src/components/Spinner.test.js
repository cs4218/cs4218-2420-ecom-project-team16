import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import Spinner from "./Spinner";

describe("Spinner Component", () => {
  it("Should render the Spinner component text", () => {
    render(<MemoryRouter><Spinner/></MemoryRouter>);
    expect(screen.getByText(/redirecting to you in 3 seconds/i)).toBeInTheDocument();
  });
});