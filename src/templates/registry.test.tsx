import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { defaultProfileDocument } from "@/data/sampleProfiles";
import { assertNoDuplicateTemplateIds, getPortfolioTemplate, getResumeTemplate, portfolioTemplates, resumeTemplates } from "./registry";
import type { ProfileDocument } from "@/lib/types";

function cloneDocument(document: ProfileDocument): ProfileDocument {
  return JSON.parse(JSON.stringify(document)) as ProfileDocument;
}

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

  it("renders templates when editable text values are duplicated", () => {
    const document = cloneDocument(defaultProfileDocument);
    document.profile.skills.push({ category: "New Category", items: ["React", "TypeScript"] });
    document.profile.skills.push({ category: "New Category", items: ["React", "TypeScript"] });
    document.profile.projects.push({ ...document.profile.projects[0], name: "New Project" });
    document.profile.projects.push({ ...document.profile.projects[0], name: "New Project" });

    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    [...resumeTemplates, ...portfolioTemplates].forEach((template) => {
      const Template = template.kind === "resume" ? getResumeTemplate(template.id) : getPortfolioTemplate(template.id);
      const view = render(<Template document={document} />);
      view.unmount();
    });

    const duplicateKeyWarnings = consoleError.mock.calls.filter((call) =>
      call.some((part) => String(part).includes("same key"))
    );
    consoleError.mockRestore();
    expect(duplicateKeyWarnings).toHaveLength(0);
  });
});
