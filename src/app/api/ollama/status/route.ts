import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const response = await fetch("http://127.0.0.1:11434/api/tags", {
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
