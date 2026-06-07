export const MAX_PROFILE_JSON_BYTES = 256 * 1024;
export const MAX_JOB_DESCRIPTION_CHARS = 20_000;
export const MAX_PORTFOLIO_PDF_BYTES = 6 * 1024 * 1024;
export const MAX_PORTFOLIO_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024;
export const MAX_PORTFOLIO_ASSET_BYTES = 500 * 1024;
export const MAX_PORTFOLIO_ASSETS = 20;
export const MAX_REMOTE_PORTFOLIO_IMAGE_BYTES = 1024 * 1024;
export const MAX_REMOTE_PORTFOLIO_IMAGES_BYTES = 4 * 1024 * 1024;
export const MAX_REMOTE_PORTFOLIO_REDIRECTS = 3;
export const REMOTE_PORTFOLIO_IMAGE_TIMEOUT_MS = 5_000;

export const rateLimitBuckets = {
  pdfExport: {
    id: "pdf-export",
    limit: 10,
    windowMs: 10 * 60 * 1000
  },
  portfolioPdfExport: {
    id: "portfolio-pdf-export",
    limit: 6,
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
