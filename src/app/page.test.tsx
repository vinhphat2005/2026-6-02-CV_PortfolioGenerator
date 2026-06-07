import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Home from "./page";

vi.mock("@/features/app/CareerForgeApp", () => ({
  CareerForgeApp: () => <div>Career Forge App Shell</div>
}));

describe("home page", () => {
  it("renders the extracted application shell", () => {
    render(<Home />);
    expect(screen.getByText("Career Forge App Shell")).toBeInTheDocument();
  });
});
