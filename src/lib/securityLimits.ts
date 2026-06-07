export const MAX_PROFILE_JSON_BYTES = 256 * 1024;
export const MAX_JOB_DESCRIPTION_CHARS = 20_000;

export const rateLimitBuckets = {
  pdfExport: {
    id: "pdf-export",
    limit: 10,
    windowMs: 10 * 60 * 1000
  },
  aiReview: {
    id: "ai-review",
    limit: 6,
    windowMs: 10 * 60 * 1000
  },
  ollamaStatus: {
    id: "ollama-status",
    limit: 60,
    windowMs: 60 * 1000
  }
} as const;

