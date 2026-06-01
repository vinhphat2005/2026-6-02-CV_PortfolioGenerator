import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { defaultProfileDocument } from "@/data/sampleProfiles";
import { assertNoDuplicateTemplateIds, getPortfolioTemplate, getResumeTemplate, portfolioTemplates, resumeTemplates } from "./registry";

describe("template registry", () => {
  it("rejects duplicate template ids", () => {
    expect(() =>
      assertNoDuplicateTemplateIds([
        { ...resumeTemplates[0], id: "duplicate" },
        { ...resumeTemplates[1], id: "duplicate" }
      ])
    ).toThrow(/Duplicate template id/);
  });

  it("renders all resume templates with sample data", () => {
    resumeTemplates.forEach((template) => {
      const Template = getResumeTemplate(template.id);
      const view = render(<Template document={defaultProfileDocument} />);
      expect(view.getByText(defaultProfileDocument.profile.personal.name)).toBeInTheDocument();
      view.unmount();
    });
  });

  it("renders all portfolio templates with sample data", () => {
    portfolioTemplates.forEach((template) => {
      const Template = getPortfolioTemplate(template.id);
      const view = render(<Template document={defaultProfileDocument} />);
      expect(view.getByText(defaultProfileDocument.profile.personal.name)).toBeInTheDocument();
      view.unmount();
    });
  });
});
