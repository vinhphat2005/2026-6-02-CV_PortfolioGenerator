import { describe, expect, it, vi } from "vitest";
import { defaultProfileDocument } from "@/data/sampleProfiles";
import { MAX_REMOTE_PORTFOLIO_IMAGE_BYTES } from "./securityLimits";
import {
  isPrivateNetworkAddress,
  resolveRemotePortfolioImages
} from "./portfolioPdfSecurity";

function documentWithRemoteImage(url = "https://images.example.test/work.webp") {
  const document = structuredClone(defaultProfileDocument);
  document.portfolio.caseStudies[0].coverImage = { kind: "url", url, alt: "Work" };
  return document;
}

const publicLookup = async () => [{ address: "8.8.8.8", family: 4 }];

describe("portfolio PDF remote image security", () => {
  it("recognizes private IPv4 and IPv6 ranges", () => {
    expect(isPrivateNetworkAddress("127.0.0.1")).toBe(true);
    expect(isPrivateNetworkAddress("192.168.1.1")).toBe(true);
    expect(isPrivateNetworkAddress("fd00::1")).toBe(true);
    expect(isPrivateNetworkAddress("fe90::1")).toBe(true);
    expect(isPrivateNetworkAddress("ff02::1")).toBe(true);
    expect(isPrivateNetworkAddress("203.0.113.10")).toBe(true);
    expect(isPrivateNetworkAddress("8.8.8.8")).toBe(false);
  });

  it("converts a validated public image into a data asset", async () => {
    const result = await resolveRemotePortfolioImages(documentWithRemoteImage(), {}, {
      lookupHost: publicLookup,
      fetcher: vi.fn(async () => new Response(new Uint8Array([1, 2, 3]), {
        status: 200,
        headers: { "Content-Type": "image/webp" }
      })) as typeof fetch
    });

    expect(result.document.portfolio.caseStudies[0].coverImage?.kind).toBe("asset");
    expect(Object.values(result.assets)[0]).toMatch(/^data:image\/webp;base64,/);
  });

  it("drops images resolving to private networks or redirecting to them", async () => {
    const fetcher = vi.fn(async () => new Response(null, {
      status: 302,
      headers: { Location: "https://internal.example.test/image.webp" }
    })) as typeof fetch;
    const lookupHost = async (hostname: string) => [{
      address: hostname.startsWith("internal") ? "10.0.0.1" : "8.8.8.8",
      family: 4
    }];

    const result = await resolveRemotePortfolioImages(documentWithRemoteImage(), {}, { lookupHost, fetcher });

    expect(result.document.portfolio.caseStudies[0].coverImage).toBeUndefined();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("drops unsupported and oversized remote images", async () => {
    const invalidMime = await resolveRemotePortfolioImages(documentWithRemoteImage(), {}, {
      lookupHost: publicLookup,
      fetcher: vi.fn(async () => new Response("html", {
        status: 200,
        headers: { "Content-Type": "text/html" }
      })) as typeof fetch
    });
    expect(invalidMime.document.portfolio.caseStudies[0].coverImage).toBeUndefined();

    const oversized = await resolveRemotePortfolioImages(documentWithRemoteImage(), {}, {
      lookupHost: publicLookup,
      fetcher: vi.fn(async () => new Response(new Uint8Array(MAX_REMOTE_PORTFOLIO_IMAGE_BYTES + 1), {
        status: 200,
        headers: { "Content-Type": "image/png" }
      })) as typeof fetch
    });
    expect(oversized.document.portfolio.caseStudies[0].coverImage).toBeUndefined();
  });
});
