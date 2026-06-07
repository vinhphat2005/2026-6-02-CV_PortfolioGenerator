import { describe, expect, it } from "vitest";
import { sampleProfiles } from "@/data/sampleProfiles";
import { defaultPresentationSettings, ProfileDocumentSchema, ProfileSchema } from "./schema";

describe("ProfileSchema", () => {
  it("validates every sample profile", () => {
    Object.values(sampleProfiles).forEach((document) => {
      expect(() => ProfileDocumentSchema.parse(document)).not.toThrow();
    });
  });

  it("rejects invalid profile data with useful errors", () => {
    const result = ProfileSchema.safeParse({
      personal: {
        name: "",
        title: "Developer",
        email: "not-an-email",
        links: []
      },
      summary: "",
      skills: []
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
    }
  });

  it("defaults presentation settings to English labels", () => {
    expect(defaultPresentationSettings.language).toBe("en");
    expect(defaultPresentationSettings.sectionLabels.experience).toBe("Experience");
  });

  it("allows only http and https URLs", () => {
    const valid = structuredClone(sampleProfiles["fullstack-developer"]);
    valid.profile.personal.website = "https://example.dev";
    expect(() => ProfileDocumentSchema.parse(valid)).not.toThrow();

    const invalid = structuredClone(sampleProfiles["fullstack-developer"]);
    invalid.profile.personal.website = "javascript:alert(1)";
    invalid.profile.projects[0].repo = "data:text/html,<script>alert(1)</script>";
    expect(ProfileDocumentSchema.safeParse(invalid).success).toBe(false);
  });

  it("strips unknown fields while normalizing", () => {
    const parsed = ProfileDocumentSchema.parse({
      ...sampleProfiles["fullstack-developer"],
      profile: {
        ...sampleProfiles["fullstack-developer"].profile,
        injected: "<script>alert(1)</script>"
      }
    });

    expect("injected" in parsed.profile).toBe(false);
  });

  it("adds portfolio defaults to older exported documents", () => {
    const legacy = structuredClone(sampleProfiles["fullstack-developer"]) as Record<string, unknown>;
    delete legacy.portfolio;

    const parsed = ProfileDocumentSchema.parse(legacy);

    expect(parsed.portfolio.title).toBe("My Portfolio");
    expect(parsed.portfolio.caseStudies).toEqual([]);
  });

  it("rejects unsafe portfolio image and case study links", () => {
    const invalid = structuredClone(sampleProfiles["fullstack-developer"]);
    invalid.portfolio.caseStudies[0].coverImage = {
      kind: "url",
      url: "javascript:alert(1)"
    };
    invalid.portfolio.caseStudies[0].links = [
      { label: "Unsafe", url: "data:text/html,<script>alert(1)</script>" }
    ];

    expect(ProfileDocumentSchema.safeParse(invalid).success).toBe(false);

    const insecureImage = structuredClone(sampleProfiles["fullstack-developer"]);
    insecureImage.portfolio.caseStudies[0].coverImage = {
      kind: "url",
      url: "http://images.example.com/work.png"
    };
    expect(ProfileDocumentSchema.safeParse(insecureImage).success).toBe(false);
  });
});
