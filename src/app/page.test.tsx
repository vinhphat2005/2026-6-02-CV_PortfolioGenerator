import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("home page", () => {
  it("renders the landing page with a studio entry point", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { name: "Career Forge" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Open Studio" })[0]).toHaveAttribute("href", "/studio");
  });
});
