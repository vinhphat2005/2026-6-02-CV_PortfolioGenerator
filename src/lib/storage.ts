import { ProfileDocumentSchema, normalizeDocument } from "./schema";
import type { ProfileDocument } from "./types";

export const STORAGE_KEY = "career-forge-profile-document";

export function serializeProfileDocument(document: ProfileDocument) {
  return JSON.stringify(ProfileDocumentSchema.parse(document), null, 2);
}

export function parseProfileDocument(raw: string): ProfileDocument {
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
  if (typeof window === "undefined") {
    return null;
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    return parseProfileDocument(raw);
  } catch {
    return null;
  }
}

export function saveStoredDocument(document: ProfileDocument) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, serializeProfileDocument(document));
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
