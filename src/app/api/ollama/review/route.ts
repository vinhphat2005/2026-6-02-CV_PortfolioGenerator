import { NextResponse } from "next/server";
import { ProfileDocumentSchema, normalizeDocument, projectCollaborationLabels } from "@/lib/schema";
import { matchJobDescription } from "@/lib/jdMatcher";
import { scoreProfile } from "@/lib/scoring/scoring";
import { MAX_JOB_DESCRIPTION_CHARS, MAX_PROFILE_JSON_BYTES, rateLimitBuckets } from "@/lib/securityLimits";
import { guardedJsonError, rateLimit, rateLimitHeaders, readLimitedJson } from "@/lib/serverSecurity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OLLAMA_BASE_URL = (process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434").replace(/\/$/, "");
const DEFAULT_OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.1";

function isOllamaReviewEnabled() {
  if (process.env.ENABLE_OLLAMA_REVIEW === "true") return true;
  if (process.env.ENABLE_OLLAMA_REVIEW === "false") return false;
  return process.env.NODE_ENV !== "production";
}

export async function POST(request: Request) {
  const limit = rateLimit(request, rateLimitBuckets.aiReview);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many AI review requests. Please try again later." },
      { status: 429, headers: rateLimitHeaders(limit) }
    );
  }

  if (!isOllamaReviewEnabled()) {
    return NextResponse.json({ error: "AI review is disabled on this hosted deployment." }, { status: 403 });
  }

  try {
    const body = await readLimitedJson<{ document?: unknown; jobDescription?: string; model?: string }>(request, MAX_PROFILE_JSON_BYTES);
    const jobDescription = typeof body.jobDescription === "string" ? body.jobDescription : "";
    if (jobDescription.length > MAX_JOB_DESCRIPTION_CHARS) {
      return NextResponse.json({ error: "Job description is too large." }, { status: 413 });
    }
    const document = normalizeDocument(ProfileDocumentSchema.parse(body.document));
    const score = scoreProfile(document, jobDescription);
    const match = jobDescription ? matchJobDescription(document, jobDescription) : null;
    const prompt = [
      "Review this software engineering resume. Return concise, honest suggestions only.",
      "Do not invent experience. If a suggestion depends on truth, say 'if true'.",
      `Target role: ${document.settings.targetRole}`,
      `Score: ${score.total}`,
      `Warnings: ${score.warnings.join("; ")}`,
      match ? `JD matched: ${match.matchedKeywords.join(", ")}. Missing: ${match.missingKeywords.join(", ")}` : "",
      `Summary: ${document.profile.summary}`,
      `Projects: ${document.profile.projects
        .map((project) => `${project.name} (${projectCollaborationLabels[project.collaboration || "personal"]}): ${project.highlights.join(" ")}`)
        .join("\n")}`
    ].join("\n");

    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: typeof body.model === "string" && body.model.length <= 80 ? body.model : DEFAULT_OLLAMA_MODEL,
        prompt,
        stream: false
      }),
      signal: AbortSignal.timeout(30_000)
    });
    if (!response.ok) {
      return NextResponse.json({ error: "Ollama is not available or no compatible model is installed." }, { status: 503 });
    }
    const data = (await response.json()) as { response?: string };
    return NextResponse.json({ review: data.response ?? "" });
  } catch (error) {
    const guarded = guardedJsonError(error, "AI review failed.");
    if (guarded.status !== 500) {
      return NextResponse.json(guarded.body, { status: guarded.status });
    }
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid profile document." }, { status: 400 });
    }
    return NextResponse.json(guarded.body, { status: guarded.status });
  }
}
