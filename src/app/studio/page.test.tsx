import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import StudioPage from "./page";

vi.mock("@/features/app/CareerForgeApp", () => ({
  CareerForgeApp: () => <div>Career Forge App Shell</div>
}));

describe("studio page", () => {
  it("renders the extracted application shell", () => {
    render(<StudioPage />);
    expect(screen.getByText("Career Forge App Shell")).toBeInTheDocument();
  });
});
