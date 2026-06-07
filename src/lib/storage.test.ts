import { describe, expect, it } from "vitest";
import { defaultProfileDocument } from "@/data/sampleProfiles";
import {
  exportFileName,
  loadStoredDocument,
  loadStoredDocumentWithSession,
  parseProfileDocument,
  resetStoredDocument,
  saveStoredDocument,
  serializeProfileDocument,
  storageKeyForSession,
  STORAGE_KEY,
  STORAGE_SESSION_KEY
} from "./storage";
import { MAX_PROFILE_JSON_BYTES } from "./securityLimits";
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
    window.localStorage.removeItem(STORAGE_SESSION_KEY);
    const draft = cloneDocument(defaultProfileDocument);
    draft.profile.skills[2].items = [];

    expect(() => saveStoredDocument(draft)).not.toThrow();

    const stored = loadStoredDocument();
    expect(stored?.profile.skills[2].items).toEqual([]);
  });

  it("migrates legacy autosave into a local session key", () => {
    window.localStorage.clear();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProfileDocument));

    const loaded = loadStoredDocumentWithSession();

    expect(loaded.autosaveAvailable).toBe(true);
    expect(loaded.migrated).toBe(true);
    expect(loaded.sessionId).toBeTruthy();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(window.localStorage.getItem(storageKeyForSession(loaded.sessionId as string))).toBeTruthy();
  });

  it("resets local autosave to a new session", () => {
    window.localStorage.clear();
    const first = saveStoredDocument(defaultProfileDocument);
    expect(first.sessionId).toBeTruthy();

    const reset = resetStoredDocument();

    expect(reset.autosaveAvailable).toBe(true);
    expect(reset.sessionId).toBeTruthy();
    expect(reset.sessionId).not.toBe(first.sessionId);
    expect(window.localStorage.getItem(storageKeyForSession(first.sessionId as string))).toBeNull();
  });

  it("rejects imported profile JSON over the size limit", () => {
    const oversized = " ".repeat(MAX_PROFILE_JSON_BYTES + 1);
    expect(() => parseProfileDocument(oversized)).toThrow(/too large/i);
  });
});
