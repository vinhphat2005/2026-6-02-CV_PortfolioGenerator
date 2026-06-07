import { NextResponse } from "next/server";
import { chromium } from "playwright";
import { ProfileDocumentSchema, normalizeDocument } from "@/lib/schema";
import { renderResumeHtml } from "@/lib/pdfHtml";
import { MAX_PROFILE_JSON_BYTES, rateLimitBuckets } from "@/lib/securityLimits";
import { guardedJsonError, rateLimit, rateLimitHeaders, readLimitedJson } from "@/lib/serverSecurity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const limit = rateLimit(request, rateLimitBuckets.pdfExport);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many PDF export requests. Please try again later." },
      { status: 429, headers: rateLimitHeaders(limit) }
    );
  }

  let browser: Awaited<ReturnType<typeof chromium.launch>> | null = null;
  try {
    const body = await readLimitedJson<{ document?: unknown; templateId?: string }>(request, MAX_PROFILE_JSON_BYTES);
    const parsed = ProfileDocumentSchema.parse(body.document);
    const document = normalizeDocument(parsed);
    const templateId = typeof body.templateId === "string" && body.templateId.length <= 80 ? body.templateId : "classic-sidebar";
    const html = renderResumeHtml(document, templateId);

    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 1240, height: 1754 }
    });
    const page = await context.newPage();
    await page.route("**/*", (route) => {
      const url = route.request().url();
      if (url.startsWith("about:") || url.startsWith("data:") || url.startsWith("blob:")) {
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

    const filename = `${document.profile.personal.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-resume.pdf`;
    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    const guarded = guardedJsonError(error, "PDF export failed.");
    if (guarded.status !== 500) {
      return NextResponse.json(guarded.body, { status: guarded.status });
    }
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid profile document." }, { status: 400 });
    }
    return NextResponse.json(guarded.body, { status: guarded.status });
  } finally {
    await browser?.close();
  }
}
