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

  it("restores editable legacy drafts without a portfolio", () => {
    window.localStorage.clear();
    const legacyDraft = cloneDocument(defaultProfileDocument) as unknown as Record<string, unknown>;
    delete legacyDraft.portfolio;
    const sessionId = "legacy-session-123";
    window.localStorage.setItem(STORAGE_SESSION_KEY, sessionId);
    window.localStorage.setItem(storageKeyForSession(sessionId), JSON.stringify(legacyDraft));

    const loaded = loadStoredDocumentWithSession();

    expect(loaded.document?.portfolio.title).toContain("Portfolio");
  });

  it("normalizes malformed autosave fields without trusting unknown keys", () => {
    window.localStorage.clear();
    const sessionId = "malformed-session-123";
    window.localStorage.setItem(STORAGE_SESSION_KEY, sessionId);
    window.localStorage.setItem(storageKeyForSession(sessionId), JSON.stringify({
      profile: {
        personal: { name: "", title: "", email: "", links: [], injected: "unsafe" },
        summary: "",
        skills: [{ category: "", items: [] }],
        projects: []
      },
      settings: { sectionOrder: [], hiddenSections: [] },
      portfolio: {
        caseStudies: [{ title: "Draft", challenge: "", solution: "", gallery: "invalid" }],
        unknown: "<script>alert(1)</script>"
      },
      unknown: "ignored"
    }));

    const loaded = loadStoredDocumentWithSession().document;

    expect(loaded?.profile.skills[0].items).toEqual([]);
    expect(loaded?.portfolio.caseStudies[0].gallery).toEqual([]);
    expect(loaded?.portfolio.templateId).toBe("editorial-blue");
    expect("unknown" in (loaded?.portfolio as unknown as Record<string, unknown>)).toBe(false);
    expect("unknown" in (loaded as unknown as Record<string, unknown>)).toBe(false);
  });
});
