import { NextResponse } from "next/server";
import { ProfileDocumentSchema, normalizeDocument } from "@/lib/schema";
import { renderResumeHtml } from "@/lib/pdfHtml";
import { PdfExportBusyError, renderPdfBuffer, runExclusivePdfJob } from "@/lib/pdfRuntime";
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

  try {
    const body = await readLimitedJson<{ document?: unknown; templateId?: string }>(request, MAX_PROFILE_JSON_BYTES);
    const parsed = ProfileDocumentSchema.parse(body.document);
    const document = normalizeDocument(parsed);
    const templateId = typeof body.templateId === "string" && body.templateId.length <= 80 ? body.templateId : "classic-sidebar";
    const html = renderResumeHtml(document, templateId);

    const pdf = await runExclusivePdfJob(() => renderPdfBuffer(html, (route) => {
      const url = route.request().url();
      if (url.startsWith("about:") || url.startsWith("data:") || url.startsWith("blob:")) {
        return route.continue();
      }
      return route.abort();
    }));

    const filename = `${document.profile.personal.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-resume.pdf`;
    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    if (error instanceof PdfExportBusyError) {
      return NextResponse.json({ error: error.message }, { status: 503, headers: { "Retry-After": "15" } });
    }
    const guarded = guardedJsonError(error, "PDF export failed.");
    if (guarded.status !== 500) {
      return NextResponse.json(guarded.body, { status: guarded.status });
    }
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid profile document." }, { status: 400 });
    }
    return NextResponse.json(guarded.body, { status: guarded.status });
  }
}
