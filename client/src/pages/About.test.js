import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import About from "./About";

jest.mock("../components/Layout", () => ({ title, children }) => <div data-testid="layout-test" data-title={title}>{children}</div>);

describe("About Page", () => {
  it("renders the Layout component with title", () => {
    render(<About />);
    const layout = screen.getByTestId("layout-test");
    expect(layout).toBeInTheDocument();
    expect(layout.getAttribute("data-title")).toMatch(/about/gi);
  });

  it("renders an image with correct src and alt", () => {
    render(<About />);
    const image = screen.getByAltText("contactus");
    expect(image).toBeInTheDocument();
    expect(image.getAttribute("src")).toMatch(/about.jpeg/gi);
  });

  it("renders the Add text paragraph", () => {
    render(<About />);
    const paragraph = screen.getByText("Add text");
    expect(paragraph).toBeInTheDocument();
  });
});