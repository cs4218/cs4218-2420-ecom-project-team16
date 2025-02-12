import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";
import Users from "../../pages/admin/Users";
import { MemoryRouter } from "react-router-dom";

jest.mock("../../components/Layout", () => ({ children }) => <div>{ children }</div>);
jest.mock("../../components/AdminMenu", () => () => <div>Mock Admin Menu</div>);

describe("Users Component", () => {
    test("Renders the Users page", () => {
        render(
            <MemoryRouter>
                <Users />
            </MemoryRouter>
        );

        expect(screen.getByText("All Users")).toBeInTheDocument();
        expect(screen.getByText("Mock Admin Menu")).toBeInTheDocument();
    });
})
