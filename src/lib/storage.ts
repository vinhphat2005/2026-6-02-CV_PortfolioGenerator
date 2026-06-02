import {
  defaultPresentationSettings,
  defaultSectionLabels,
  ensureAllSections,
  ProfileDocumentSchema,
  normalizeDocument
} from "./schema";
import type { ProfileDocument } from "./types";

export const STORAGE_KEY = "career-forge-profile-document";

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
    return parseStoredProfileDocument(raw);
  } catch {
    return null;
  }
}

export function saveStoredDocument(document: ProfileDocument) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, serializeProfileDraft(document));
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
