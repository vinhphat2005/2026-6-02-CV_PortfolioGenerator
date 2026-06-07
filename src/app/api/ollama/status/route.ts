import { NextResponse } from "next/server";
import { rateLimitBuckets } from "@/lib/securityLimits";
import { rateLimit, rateLimitHeaders } from "@/lib/serverSecurity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OLLAMA_BASE_URL = (process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434").replace(/\/$/, "");

function isOllamaReviewEnabled() {
  if (process.env.ENABLE_OLLAMA_REVIEW === "true") return true;
  if (process.env.ENABLE_OLLAMA_REVIEW === "false") return false;
  return process.env.NODE_ENV !== "production";
}

export async function GET(request: Request) {
  const limit = rateLimit(request, rateLimitBuckets.ollamaStatus);
  if (!limit.ok) {
    return NextResponse.json(
      { available: false, error: "Too many status requests." },
      { status: 429, headers: rateLimitHeaders(limit) }
    );
  }

  if (!isOllamaReviewEnabled()) {
    return NextResponse.json({ available: false, disabled: true });
  }

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      signal: AbortSignal.timeout(900)
    });
    if (!response.ok) {
      return NextResponse.json({ available: false });
    }
    const data = (await response.json()) as { models?: Array<{ name: string }> };
    return NextResponse.json({
      available: true,
      models: data.models?.map((model) => model.name) ?? []
    });
  } catch {
    return NextResponse.json({ available: false });
  }
}
