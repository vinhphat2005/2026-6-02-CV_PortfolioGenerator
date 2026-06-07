import { NextResponse } from "next/server";
import { chromium } from "playwright";
import { renderPortfolioDeckHtml } from "@/lib/portfolioDeckHtml";
import { isAllowedPortfolioPdfRequest, resolveRemotePortfolioImages } from "@/lib/portfolioPdfSecurity";
import { ProfileDocumentSchema, normalizeDocument } from "@/lib/schema";
import {
  MAX_PORTFOLIO_ASSETS,
  MAX_PORTFOLIO_PDF_BYTES,
  rateLimitBuckets
} from "@/lib/securityLimits";
import { guardedJsonError, rateLimit, rateLimitHeaders, readLimitedJson } from "@/lib/serverSecurity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const dataImagePattern = /^data:image\/(?:png|jpeg|webp);base64,[a-zA-Z0-9+/=\s]+$/;

function sanitizedAssets(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  return Object.fromEntries(
    Object.entries(input)
      .slice(0, MAX_PORTFOLIO_ASSETS)
      .filter(([key, value]) =>
        /^[a-zA-Z0-9._:-]{8,100}$/.test(key) &&
        typeof value === "string" &&
        value.length <= 700_000 &&
        dataImagePattern.test(value)
      )
  );
}

export async function POST(request: Request) {
  const limit = rateLimit(request, rateLimitBuckets.portfolioPdfExport);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many portfolio PDF export requests. Please try again later." },
      { status: 429, headers: rateLimitHeaders(limit) }
    );
  }

  let browser: Awaited<ReturnType<typeof chromium.launch>> | null = null;
  try {
    const body = await readLimitedJson<{ document?: unknown; assets?: unknown }>(request, MAX_PORTFOLIO_PDF_BYTES);
    const document = normalizeDocument(ProfileDocumentSchema.parse(body.document));
    const resolved = await resolveRemotePortfolioImages(document, sanitizedAssets(body.assets));
    const html = renderPortfolioDeckHtml(resolved.document, resolved.assets);

    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 1240, height: 1754 }
    });
    const page = await context.newPage();
    await page.route("**/*", (route) => {
      if (isAllowedPortfolioPdfRequest(route.request().url())) {
        return route.continue();
      }
      return route.abort();
    });
    await page.setContent(html, { waitUntil: "networkidle" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true
    });

    const slug = document.profile.personal.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${slug || "portfolio"}-portfolio-deck.pdf"`
      }
    });
  } catch (error) {
    const guarded = guardedJsonError(error, "Portfolio PDF export failed.");
    if (guarded.status !== 500) {
      return NextResponse.json(guarded.body, { status: guarded.status });
    }
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid portfolio document." }, { status: 400 });
    }
    return NextResponse.json(guarded.body, { status: guarded.status });
  } finally {
    await browser?.close();
  }
}
