import { describe, expect, it } from "vitest";
import { calculatePreviewScale } from "./ScaledPreview";

describe("responsive preview scale", () => {
  it("fits an A4 page into narrow and wide containers", () => {
    expect(calculatePreviewScale(390)).toBeLessThan(0.5);
    expect(calculatePreviewScale(1600)).toBe(1);
  });

  it("clamps zoom between 75% and 150% of fit", () => {
    const fit = calculatePreviewScale(800, 1);
    expect(calculatePreviewScale(800, 0.2)).toBeCloseTo(fit * 0.75);
    expect(calculatePreviewScale(800, 2)).toBeCloseTo(fit * 1.5);
  });
});
