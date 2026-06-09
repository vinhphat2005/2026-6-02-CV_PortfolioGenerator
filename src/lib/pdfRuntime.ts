import { chromium, type Browser } from "playwright";

type PdfRouteHandler = Parameters<Awaited<ReturnType<Browser["newContext"]>>["route"]>[1];

let pdfJobActive = false;

export class PdfExportBusyError extends Error {
  constructor() {
    super("Another PDF export is currently running. Please try again in a few seconds.");
    this.name = "PdfExportBusyError";
  }
}

export async function runExclusivePdfJob<T>(job: () => Promise<T>) {
  if (pdfJobActive) {
    throw new PdfExportBusyError();
  }
  pdfJobActive = true;
  try {
    return await job();
  } finally {
    pdfJobActive = false;
  }
}

export async function renderPdfBuffer(html: string, routeHandler: PdfRouteHandler) {
  let browser: Awaited<ReturnType<typeof chromium.launch>> | null = null;
  try {
    browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-extensions",
        "--disable-background-networking",
        "--disable-background-timer-throttling",
        "--disable-breakpad",
        "--disable-client-side-phishing-detection",
        "--disable-component-extensions-with-background-pages",
        "--disable-default-apps",
        "--disable-features=Translate,BackForwardCache,AcceptCHFrame,MediaRouter,OptimizationHints",
        "--disable-hang-monitor",
        "--disable-popup-blocking",
        "--disable-prompt-on-repost",
        "--disable-renderer-backgrounding",
        "--disable-sync",
        "--metrics-recording-only",
        "--mute-audio",
        "--no-default-browser-check",
        "--no-first-run",
        "--password-store=basic",
        "--use-mock-keychain"
      ]
    });
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 794, height: 1123 }
    });
    const page = await context.newPage();
    await page.route("**/*", routeHandler);
    await page.setContent(html, { waitUntil: "load", timeout: 30_000 });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true
    });
    await context.close();
    return pdf;
  } finally {
    await browser?.close();
  }
}

export function resetPdfRuntimeForTests() {
  pdfJobActive = false;
}
