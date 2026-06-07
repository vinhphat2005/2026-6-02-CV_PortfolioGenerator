import { describe, expect, it } from "vitest";
import {
  MAX_PORTFOLIO_IMAGE_UPLOAD_BYTES
} from "./securityLimits";
import { validatePortfolioImageFile } from "./portfolioAssets";

describe("portfolio image validation", () => {
  it("accepts supported image types under the upload limit", () => {
    expect(() => validatePortfolioImageFile({ type: "image/webp", size: 1024 })).not.toThrow();
  });

  it("rejects unsupported and oversized uploads", () => {
    expect(() => validatePortfolioImageFile({ type: "image/svg+xml", size: 1024 })).toThrow(/PNG, JPEG, or WebP/);
    expect(() => validatePortfolioImageFile({
      type: "image/png",
      size: MAX_PORTFOLIO_IMAGE_UPLOAD_BYTES + 1
    })).toThrow(/5 MB/);
  });
});
