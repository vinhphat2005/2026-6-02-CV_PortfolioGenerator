import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import {
  clearPortfolioImages,
  deletePortfolioImage,
  getPortfolioImage,
  storePortfolioImage
} from "./portfolioAssets";
import { STORAGE_SESSION_KEY } from "./localSession";

const DB_NAME = "career-forge-assets";

function deleteDatabase() {
  return new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("Database deletion was blocked."));
  });
}

function smallImage(name = "image.webp") {
  return new File([new Uint8Array([1, 2, 3])], name, { type: "image/webp" });
}

describe("session-scoped portfolio assets", () => {
  beforeEach(async () => {
    window.localStorage.clear();
    await deleteDatabase();
  });

  it("isolates reads, deletes, and clears by session", async () => {
    const assetA = await storePortfolioImage(smallImage(), "session-a-123");
    const assetB = await storePortfolioImage(smallImage(), "session-b-123");

    expect(await getPortfolioImage(assetA, "session-a-123")).toBeTruthy();
    expect(await getPortfolioImage(assetA, "session-b-123")).toBeNull();
    await deletePortfolioImage(assetA, "session-b-123");
    expect(await getPortfolioImage(assetA, "session-a-123")).toBeTruthy();
    await clearPortfolioImages("session-a-123");
    expect(await getPortfolioImage(assetA, "session-a-123")).toBeNull();
    expect(await getPortfolioImage(assetB, "session-b-123")).toBeTruthy();
  });

  it("applies the 20 image limit per session", async () => {
    for (let index = 0; index < 20; index += 1) {
      await storePortfolioImage(smallImage(`a-${index}.webp`), "session-a-123");
    }
    await expect(storePortfolioImage(smallImage("overflow.webp"), "session-a-123")).rejects.toThrow(/20 images/);
    await expect(storePortfolioImage(smallImage("b.webp"), "session-b-123")).resolves.toBeTruthy();
  });

  it("migrates legacy records into the active session", async () => {
    window.localStorage.setItem(STORAGE_SESSION_KEY, "legacy-session-123");
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => request.result.createObjectStore("portfolio-images", { keyPath: "id" });
      request.onsuccess = () => {
        const database = request.result;
        const transaction = database.transaction("portfolio-images", "readwrite");
        transaction.objectStore("portfolio-images").add({
          id: "legacy-asset-123",
          blob: smallImage(),
          name: "legacy.webp",
          createdAt: Date.now()
        });
        transaction.oncomplete = () => {
          database.close();
          resolve();
        };
        transaction.onerror = () => reject(transaction.error);
      };
      request.onerror = () => reject(request.error);
    });

    expect(await getPortfolioImage("legacy-asset-123", "legacy-session-123")).toBeTruthy();
    expect(await getPortfolioImage("legacy-asset-123", "different-session-123")).toBeNull();
  });
});
