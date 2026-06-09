import { ProfileDocumentSchema, normalizeDocument } from "./schema";
import { normalizeStoredDraft } from "./draftNormalizer";
import {
  getOrCreateLocalSessionId,
  isValidSessionId,
  replaceLocalSessionId,
  STORAGE_SESSION_KEY
} from "./localSession";
import { MAX_PROFILE_JSON_BYTES } from "./securityLimits";
import type { ProfileDocument } from "./types";

export const STORAGE_KEY = "career-forge-profile-document";
export { STORAGE_SESSION_KEY } from "./localSession";

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

function rawByteLength(value: string) {
  return new TextEncoder().encode(value).byteLength;
}

export function storageKeyForSession(sessionId: string) {
  return `${STORAGE_KEY}:${sessionId}`;
}

function parseStoredProfileDocument(raw: string): ProfileDocument {
  const parsed = JSON.parse(raw) as unknown;
  const validated = ProfileDocumentSchema.safeParse(parsed);
  if (validated.success) {
    return normalizeDocument(validated.data);
  }

  return normalizeStoredDraft(parsed);
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
    sessionId = getOrCreateLocalSessionId();
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
    const sessionId = getOrCreateLocalSessionId();
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

    const nextSessionId = replaceLocalSessionId();
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

export function downloadBlobFile(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  window.setTimeout(() => {
    URL.revokeObjectURL(url);
    anchor.remove();
  }, 1000);
}

export function downloadTextFile(filename: string, content: string, type = "application/json") {
  downloadBlobFile(filename, new Blob([content], { type }));
}
