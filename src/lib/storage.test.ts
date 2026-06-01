import { describe, expect, it } from "vitest";
import { defaultProfileDocument } from "@/data/sampleProfiles";
import { exportFileName, parseProfileDocument, serializeProfileDocument } from "./storage";

describe("profile document storage helpers", () => {
  it("serializes and parses a profile document", () => {
    const serialized = serializeProfileDocument(defaultProfileDocument);
    const parsed = parseProfileDocument(serialized);
    expect(parsed.profile.personal.name).toBe(defaultProfileDocument.profile.personal.name);
    expect(parsed.settings.sectionLabels.summary).toBe("Summary");
  });

  it("creates a stable export file name", () => {
    expect(exportFileName(defaultProfileDocument)).toContain("alex-morgan");
  });
});
