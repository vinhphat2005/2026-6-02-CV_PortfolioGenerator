import { NextResponse } from "next/server";
import { chromium } from "playwright";
import { ProfileDocumentSchema, normalizeDocument } from "@/lib/schema";
import { renderResumeHtml } from "@/lib/pdfHtml";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let browser: Awaited<ReturnType<typeof chromium.launch>> | null = null;
  try {
    const body = (await request.json()) as { document?: unknown; templateId?: string };
    const parsed = ProfileDocumentSchema.parse(body.document);
    const document = normalizeDocument(parsed);
    const templateId = body.templateId || "classic-sidebar";
    const html = renderResumeHtml(document, templateId);

    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1240, height: 1754 } });
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
    const message = error instanceof Error ? error.message : "PDF export failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await browser?.close();
  }
}
