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
});
