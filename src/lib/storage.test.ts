import { describe, expect, it } from "vitest";
import { defaultProfileDocument } from "@/data/sampleProfiles";
import {
  exportFileName,
  loadStoredDocument,
  parseProfileDocument,
  saveStoredDocument,
  serializeProfileDocument,
  STORAGE_KEY
} from "./storage";
import type { ProfileDocument } from "./types";

function cloneDocument(document: ProfileDocument): ProfileDocument {
  return JSON.parse(JSON.stringify(document)) as ProfileDocument;
}

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

  it("autosaves editable drafts that are temporarily invalid", () => {
    window.localStorage.removeItem(STORAGE_KEY);
    const draft = cloneDocument(defaultProfileDocument);
    draft.profile.skills[2].items = [];

    expect(() => saveStoredDocument(draft)).not.toThrow();

    const stored = loadStoredDocument();
    expect(stored?.profile.skills[2].items).toEqual([]);
  });
});
