import { NextResponse } from "next/server";
import { ProfileDocumentSchema, normalizeDocument, projectCollaborationLabels } from "@/lib/schema";
import { matchJobDescription } from "@/lib/jdMatcher";
import { scoreProfile } from "@/lib/scoring/scoring";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { document?: unknown; jobDescription?: string; model?: string };
    const document = normalizeDocument(ProfileDocumentSchema.parse(body.document));
    const score = scoreProfile(document, body.jobDescription);
    const match = body.jobDescription ? matchJobDescription(document, body.jobDescription) : null;
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

    const response = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: body.model || "llama3.1",
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
    const message = error instanceof Error ? error.message : "AI review failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
