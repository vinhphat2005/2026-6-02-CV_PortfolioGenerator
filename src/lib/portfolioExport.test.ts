import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import { defaultProfileDocument } from "@/data/sampleProfiles";
import { buildPortfolioZip, generatePortfolioHtml } from "./portfolioExport";

describe("portfolio export", () => {
  it("generates static HTML", () => {
    const html = generatePortfolioHtml(defaultProfileDocument, "clean-product-engineer");
    expect(html).toContain("<!doctype html>");
    expect(html).toContain(defaultProfileDocument.profile.personal.name);
  });

  it("exports a zip containing index.html", async () => {
    const blob = await buildPortfolioZip(defaultProfileDocument, "clean-product-engineer");
    const zip = await JSZip.loadAsync(blob);
    expect(zip.file("index.html")).toBeTruthy();
  });
});
