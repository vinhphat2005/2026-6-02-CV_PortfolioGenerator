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
});
