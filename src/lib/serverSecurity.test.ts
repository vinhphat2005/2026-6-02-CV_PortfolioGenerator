import { describe, expect, it, beforeEach } from "vitest";
import { MAX_PROFILE_JSON_BYTES } from "./securityLimits";
import { rateLimit, readLimitedJson, resetRateLimits } from "./serverSecurity";

function jsonRequest(body: unknown, headers: Record<string, string> = {}) {
  return new Request("https://example.test/api", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers
    },
    body: typeof body === "string" ? body : JSON.stringify(body)
  });
}

describe("server security helpers", () => {
  beforeEach(() => {
    resetRateLimits();
  });

  it("reads JSON within the configured payload limit", async () => {
    const data = await readLimitedJson<{ ok: boolean }>(jsonRequest({ ok: true }), MAX_PROFILE_JSON_BYTES);
    expect(data.ok).toBe(true);
  });

  it("rejects non-json content types", async () => {
    await expect(
      readLimitedJson(
        new Request("https://example.test/api", {
          method: "POST",
          headers: { "Content-Type": "text/plain" },
          body: "{}"
        }),
        MAX_PROFILE_JSON_BYTES
      )
    ).rejects.toMatchObject({ status: 415 });
  });

  it("rejects oversized JSON payloads", async () => {
    await expect(readLimitedJson(jsonRequest(" ".repeat(MAX_PROFILE_JSON_BYTES + 1)), MAX_PROFILE_JSON_BYTES))
      .rejects.toMatchObject({ status: 413 });
  });

  it("rate limits by client IP and bucket", () => {
    const bucket = { id: "test-bucket", limit: 2, windowMs: 60_000 };
    const request = new Request("https://example.test/api", {
      headers: { "x-forwarded-for": "203.0.113.7, 10.0.0.1" }
    });

    expect(rateLimit(request, bucket).ok).toBe(true);
    expect(rateLimit(request, bucket).ok).toBe(true);
    const blocked = rateLimit(request, bucket);

    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });
});
