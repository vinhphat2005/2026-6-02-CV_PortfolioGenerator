import {
  defaultPresentationSettings,
  defaultSectionLabels,
  ensureAllSections,
  ProfileDocumentSchema,
  normalizeDocument
} from "./schema";
import { MAX_PROFILE_JSON_BYTES } from "./securityLimits";
import type { ProfileDocument } from "./types";

export const STORAGE_KEY = "career-forge-profile-document";
export const STORAGE_SESSION_KEY = "career-forge-profile-session";

export type StoredDocumentLoadResult = {
  document: ProfileDocument | null;
  autosaveAvailable: boolean;
  sessionId: string | null;
  migrated: boolean;
};

export type StoredDocumentSaveResult = {
  autosaveAvailable: boolean;
  sessionId: string | null;
};

export function serializeProfileDocument(document: ProfileDocument) {
  return JSON.stringify(ProfileDocumentSchema.parse(document), null, 2);
}

function serializeProfileDraft(document: ProfileDocument) {
  return JSON.stringify(document, null, 2);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function rawByteLength(value: string) {
  return new TextEncoder().encode(value).byteLength;
}

function createSessionId() {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `session-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function isValidSessionId(value: string | null) {
  return Boolean(value && /^[a-zA-Z0-9._:-]{8,80}$/.test(value));
}

export function storageKeyForSession(sessionId: string) {
  return `${STORAGE_KEY}:${sessionId}`;
}

function getOrCreateSessionId() {
  const existing = window.localStorage.getItem(STORAGE_SESSION_KEY);
  if (isValidSessionId(existing)) {
    return existing as string;
  }

  const next = createSessionId();
  window.localStorage.setItem(STORAGE_SESSION_KEY, next);
  return next;
}

function parseStoredProfileDocument(raw: string): ProfileDocument {
  const parsed = JSON.parse(raw) as unknown;
  const validated = ProfileDocumentSchema.safeParse(parsed);
  if (validated.success) {
    return normalizeDocument(validated.data);
  }

  if (!isRecord(parsed) || !isRecord(parsed.profile)) {
    throw validated.error;
  }

  const settings = isRecord(parsed.settings) ? parsed.settings : {};
  const sectionLabels = isRecord(settings.sectionLabels) ? settings.sectionLabels : {};
  return {
    ...(parsed as ProfileDocument),
    settings: {
      ...defaultPresentationSettings,
      ...(settings as Partial<ProfileDocument["settings"]>),
      sectionLabels: {
        ...defaultSectionLabels,
        ...(sectionLabels as Record<string, string>)
      },
      hiddenSections: stringArray(settings.hiddenSections),
      sectionOrder: ensureAllSections(stringArray(settings.sectionOrder))
    }
  };
}

export function parseProfileDocument(raw: string): ProfileDocument {
  if (rawByteLength(raw) > MAX_PROFILE_JSON_BYTES) {
    throw new Error("Profile JSON is too large.");
  }
  const parsed = JSON.parse(raw) as unknown;
  return normalizeDocument(parsed);
}

export function exportFileName(document: ProfileDocument) {
  const slug = document.profile.personal.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug || "profile"}-career-forge.json`;
}

export function loadStoredDocument(): ProfileDocument | null {
  return loadStoredDocumentWithSession().document;
}

export function loadStoredDocumentWithSession(): StoredDocumentLoadResult {
  if (typeof window === "undefined") {
    return {
      document: null,
      autosaveAvailable: false,
      sessionId: null,
      migrated: false
    };
  }

  let sessionId: string;
  let raw: string | null = null;
  let migrated = false;

  try {
    sessionId = getOrCreateSessionId();
    const sessionKey = storageKeyForSession(sessionId);
    raw = window.localStorage.getItem(sessionKey);

    if (!raw) {
      const legacyRaw = window.localStorage.getItem(STORAGE_KEY);
      if (legacyRaw) {
        raw = legacyRaw;
        migrated = true;
        window.localStorage.setItem(sessionKey, legacyRaw);
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }

    if (!raw) {
      return {
        document: null,
        autosaveAvailable: true,
        sessionId,
        migrated
      };
    }
  } catch {
    return {
      document: null,
      autosaveAvailable: false,
      sessionId: null,
      migrated: false
    };
  }

  try {
    return {
      document: parseStoredProfileDocument(raw),
      autosaveAvailable: true,
      sessionId,
      migrated
    };
  } catch {
    return {
      document: null,
      autosaveAvailable: true,
      sessionId,
      migrated
    };
  }
}

export function saveStoredDocument(document: ProfileDocument): StoredDocumentSaveResult {
  if (typeof window === "undefined") {
    return {
      autosaveAvailable: false,
      sessionId: null
    };
  }
  try {
    const sessionId = getOrCreateSessionId();
    window.localStorage.setItem(storageKeyForSession(sessionId), serializeProfileDraft(document));
    return {
      autosaveAvailable: true,
      sessionId
    };
  } catch {
    return {
      autosaveAvailable: false,
      sessionId: null
    };
  }
}

export function resetStoredDocument(): StoredDocumentSaveResult {
  if (typeof window === "undefined") {
    return {
      autosaveAvailable: false,
      sessionId: null
    };
  }

  try {
    const currentSessionId = window.localStorage.getItem(STORAGE_SESSION_KEY);
    if (isValidSessionId(currentSessionId)) {
      window.localStorage.removeItem(storageKeyForSession(currentSessionId as string));
    }
    window.localStorage.removeItem(STORAGE_KEY);

    const nextSessionId = createSessionId();
    window.localStorage.setItem(STORAGE_SESSION_KEY, nextSessionId);
    return {
      autosaveAvailable: true,
      sessionId: nextSessionId
    };
  } catch {
    return {
      autosaveAvailable: false,
      sessionId: null
    };
  }
}

export function downloadTextFile(filename: string, content: string, type = "application/json") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
