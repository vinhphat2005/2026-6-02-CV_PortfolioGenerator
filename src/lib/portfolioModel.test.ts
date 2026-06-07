import { describe, expect, it } from "vitest";
import { defaultProfileDocument } from "@/data/sampleProfiles";
import { caseStudyFromProject, createPortfolioDeck } from "./portfolioModel";
import { PortfolioCaseStudySchema, PortfolioDeckSchema } from "./schema";

describe("portfolio model", () => {
  it("seeds a valid case study from a resume project", () => {
    const study = caseStudyFromProject(defaultProfileDocument.profile.projects[0], 0);

    expect(() => PortfolioCaseStudySchema.parse(study)).not.toThrow();
    expect(study.title).toBe(defaultProfileDocument.profile.projects[0].name);
    expect(study.tools.length).toBeGreaterThan(0);
  });

  it("creates a valid deck from a profile", () => {
    const deck = createPortfolioDeck(defaultProfileDocument.profile);

    expect(() => PortfolioDeckSchema.parse(deck)).not.toThrow();
    expect(deck.caseStudies.length).toBe(defaultProfileDocument.profile.projects.length);
  });
});
