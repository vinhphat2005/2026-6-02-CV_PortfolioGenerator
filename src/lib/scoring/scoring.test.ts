import { describe, expect, it } from "vitest";
import { sampleProfiles } from "@/data/sampleProfiles";
import { scoreProfile } from "./scoring";

describe("scoreProfile", () => {
  it("returns a score out of 100", () => {
    const result = scoreProfile(sampleProfiles["fullstack-developer"]);
    expect(result.total).toBeGreaterThan(0);
    expect(result.total).toBeLessThanOrEqual(100);
  });

  it("scores backend evidence better for the backend target than unrelated game target", () => {
    const backend = structuredClone(sampleProfiles["backend-developer"]);
    const gameTarget = structuredClone(sampleProfiles["backend-developer"]);
    gameTarget.settings.targetRole = "game-developer";
    expect(scoreProfile(backend).total).toBeGreaterThan(scoreProfile(gameTarget).total);
  });

  it("detects game developer engine and demo evidence", () => {
    const game = scoreProfile(sampleProfiles["game-developer"]);
    const roleGroup = game.groups.find((group) => group.id === "role-fit");
    expect(roleGroup?.score).toBeGreaterThan(10);
  });
});
