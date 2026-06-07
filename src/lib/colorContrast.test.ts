import { describe, expect, it } from "vitest";
import { accessibleTextColor, contrastRatio, meetsAaContrast } from "./colorContrast";
import { portfolioDeckTemplates } from "@/templates/registry";

describe("deck color contrast", () => {
  it("selects readable black or white text for template palette colors", () => {
    portfolioDeckTemplates.forEach((template) => {
      const primaryText = accessibleTextColor(template.palette.primary);
      const secondaryText = accessibleTextColor(template.palette.secondary);
      expect(contrastRatio(template.palette.primary, primaryText)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(template.palette.secondary, secondaryText)).toBeGreaterThanOrEqual(4.5);
    });
  });

  it("recognizes AA contrast", () => {
    expect(meetsAaContrast("#ffffff", "#111111")).toBe(true);
    expect(meetsAaContrast("#ffffff", "#eeeeee")).toBe(false);
  });
});
