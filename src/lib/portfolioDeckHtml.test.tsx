import { describe, expect, it } from "vitest";
import { defaultProfileDocument } from "@/data/sampleProfiles";
import { renderPortfolioDeckHtml } from "./portfolioDeckHtml";
import { portfolioDeckTemplates } from "@/templates/registry";

describe("portfolio deck HTML", () => {
  it("renders the required deck pages and escapes user content", () => {
    const document = structuredClone(defaultProfileDocument);
    document.portfolio.title = "<script>alert(1)</script>";
    document.portfolio.caseStudies[0].title = "Case <unsafe>";

    const html = renderPortfolioDeckHtml(document, {});

    expect(html).toContain("Table of contents");
    expect(html).toContain("Contact");
    expect(html).toContain("Case &lt;unsafe&gt;");
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("img-src data:");
    expect(html).not.toContain("img-src data: https:");
    expect(html.match(/portfolio-deck-page/g)?.length).toBeGreaterThanOrEqual(7);
  });

  it("renders every registered deck template with the full page sequence", () => {
    portfolioDeckTemplates.forEach((template) => {
      const document = structuredClone(defaultProfileDocument);
      document.portfolio.templateId = template.id as typeof document.portfolio.templateId;
      const html = renderPortfolioDeckHtml(document, {});
      expect(html).toContain(`data-deck-template="${template.id}"`);
      expect(html).toContain("Table of contents");
      expect(html).toContain("Challenge");
      expect(html).toContain("Process and outcomes");
      expect(html).toContain("Contact");
    });
  });
});
