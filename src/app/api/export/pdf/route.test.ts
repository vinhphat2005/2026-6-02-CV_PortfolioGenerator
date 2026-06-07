import { describe, expect, it, beforeEach } from "vitest";
import { resetRateLimits } from "@/lib/serverSecurity";
import { POST } from "./route";

describe("PDF export API guards", () => {
  beforeEach(() => {
    resetRateLimits();
  });

  it("rejects non-json requests before rendering", async () => {
    const response = await POST(
      new Request("https://example.test/api/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: "{}"
      })
    );

    expect(response.status).toBe(415);
  });

  it("rate limits repeated export attempts before reading the body", async () => {
    let response: Response | null = null;
    for (let index = 0; index < 11; index += 1) {
      response = await POST(
        new Request("https://example.test/api/export/pdf", {
          method: "POST",
          headers: {
            "Content-Type": "text/plain",
            "x-forwarded-for": "198.51.100.8"
          },
          body: "{}"
        })
      );
    }

    expect(response?.status).toBe(429);
    expect(response?.headers.get("Retry-After")).toBeTruthy();
  });
});

