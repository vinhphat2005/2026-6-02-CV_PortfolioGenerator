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

  it("omits unsafe href values from exported HTML", () => {
    const document = structuredClone(defaultProfileDocument);
    document.profile.personal.links = [
      { label: "Safe", url: "https://example.dev" },
      { label: "Unsafe", url: "javascript:alert(1)" }
    ];
    document.profile.projects[0].repo = "data:text/html,<script>alert(1)</script>";

    const html = generatePortfolioHtml(document, "clean-product-engineer");

    expect(html).toContain("https://example.dev");
    expect(html).not.toContain("javascript:alert");
    expect(html).not.toContain("data:text/html");
    expect(html).toContain("script-src 'none'");
    expect(html).toContain('rel="noopener noreferrer"');
  });
});
