import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { resetRateLimits } from "@/lib/serverSecurity";
import { POST } from "./route";

const originalEnabled = process.env.ENABLE_OLLAMA_REVIEW;

describe("Ollama review API guards", () => {
  beforeEach(() => {
    resetRateLimits();
  });

  afterEach(() => {
    if (originalEnabled === undefined) {
      delete process.env.ENABLE_OLLAMA_REVIEW;
    } else {
      process.env.ENABLE_OLLAMA_REVIEW = originalEnabled;
    }
  });

  it("is disabled when ENABLE_OLLAMA_REVIEW is false", async () => {
    process.env.ENABLE_OLLAMA_REVIEW = "false";
    const response = await POST(
      new Request("https://example.test/api/ollama/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}"
      })
    );

    expect(response.status).toBe(403);
  });
});

