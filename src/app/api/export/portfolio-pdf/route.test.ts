import { beforeEach, describe, expect, it } from "vitest";
import { isAllowedPortfolioPdfRequest } from "@/lib/portfolioPdfSecurity";
import { resetRateLimits } from "@/lib/serverSecurity";
import { POST } from "./route";

describe("portfolio PDF export API guards", () => {
  beforeEach(() => {
    resetRateLimits();
  });

  it("rejects non-json requests before rendering", async () => {
    const response = await POST(new Request("https://example.test/api/export/portfolio-pdf", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: "{}"
    }));

    expect(response.status).toBe(415);
  });

  it("rate limits repeated attempts before reading the body", async () => {
    let response: Response | null = null;
    for (let index = 0; index < 7; index += 1) {
      response = await POST(new Request("https://example.test/api/export/portfolio-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
          "x-forwarded-for": "198.51.100.44"
        },
        body: "{}"
      }));
    }

    expect(response?.status).toBe(429);
    expect(response?.headers.get("Retry-After")).toBeTruthy();
  });

  it("allows public HTTPS images but blocks private network requests", () => {
    expect(isAllowedPortfolioPdfRequest("https://images.example.com/work.webp")).toBe(true);
    expect(isAllowedPortfolioPdfRequest("http://images.example.com/work.webp")).toBe(false);
    expect(isAllowedPortfolioPdfRequest("https://127.0.0.1/private")).toBe(false);
    expect(isAllowedPortfolioPdfRequest("https://192.168.1.10/private")).toBe(false);
    expect(isAllowedPortfolioPdfRequest("https://[::1]/private")).toBe(false);
  });
});
