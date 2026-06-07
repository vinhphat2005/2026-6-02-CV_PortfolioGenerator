import { describe, expect, it } from "vitest";
import { defaultProfileDocument } from "@/data/sampleProfiles";
import { renderPortfolioDeckHtml } from "./portfolioDeckHtml";

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
    expect(html.match(/portfolio-deck-page/g)?.length).toBeGreaterThanOrEqual(7);
  });
});
