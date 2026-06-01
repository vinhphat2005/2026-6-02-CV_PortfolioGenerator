import { describe, expect, it } from "vitest";
import { sampleProfiles } from "@/data/sampleProfiles";
import { extractKeywords, matchJobDescription, normalizeKeyword } from "./jdMatcher";

describe("JD keyword matcher", () => {
  it("normalizes common aliases", () => {
    expect(normalizeKeyword("React.js")).toBe("React");
    expect(normalizeKeyword("Node")).toBe("Node.js");
    expect(normalizeKeyword("Postgres")).toBe("PostgreSQL");
    expect(normalizeKeyword("RESTful API")).toBe("REST API");
  });

  it("extracts technical keywords from a job description", () => {
    const keywords = extractKeywords("We need React.js, TypeScript, RESTful API, Docker and MongoDB.");
    expect(keywords).toEqual(expect.arrayContaining(["React", "TypeScript", "REST API", "Docker", "MongoDB"]));
  });

  it("reports matched and missing keywords without inventing claims", () => {
    const document = sampleProfiles["frontend-developer"];
    const result = matchJobDescription(
      document,
      "Frontend role requiring React, TypeScript, REST API, Docker, MongoDB and Redis."
    );
    expect(result.matchedKeywords).toContain("React");
    expect(result.missingKeywords).toContain("Redis");
    expect(result.suggestions.join(" ")).toContain("If this is true");
  });
});
