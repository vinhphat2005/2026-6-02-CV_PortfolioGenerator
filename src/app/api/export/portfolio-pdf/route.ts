import { NextResponse } from "next/server";
import { renderPortfolioDeckHtml } from "@/lib/portfolioDeckHtml";
import { isAllowedPortfolioPdfRequest, resolveRemotePortfolioImages } from "@/lib/portfolioPdfSecurity";
import { PdfExportBusyError, renderPdfBuffer, runExclusivePdfJob } from "@/lib/pdfRuntime";
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

  try {
    const body = await readLimitedJson<{ document?: unknown; assets?: unknown }>(request, MAX_PORTFOLIO_PDF_BYTES);
    const document = normalizeDocument(ProfileDocumentSchema.parse(body.document));
    const resolved = await resolveRemotePortfolioImages(document, sanitizedAssets(body.assets));
    const html = renderPortfolioDeckHtml(resolved.document, resolved.assets);

    const pdf = await runExclusivePdfJob(() => renderPdfBuffer(html, (route) => {
      if (isAllowedPortfolioPdfRequest(route.request().url())) {
        return route.continue();
      }
      return route.abort();
    }));

    const slug = document.profile.personal.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${slug || "portfolio"}-portfolio-deck.pdf"`
      }
    });
  } catch (error) {
    if (error instanceof PdfExportBusyError) {
      return NextResponse.json({ error: error.message }, { status: 503, headers: { "Retry-After": "15" } });
    }
    const guarded = guardedJsonError(error, "Portfolio PDF export failed.");
    if (guarded.status !== 500) {
      return NextResponse.json(guarded.body, { status: guarded.status });
    }
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid portfolio document." }, { status: 400 });
    }
    return NextResponse.json(guarded.body, { status: guarded.status });
  }
}
