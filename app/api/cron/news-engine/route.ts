import { NextRequest, NextResponse } from "next/server";
import { runNewsEnginePipeline } from "@/lib/news-engine";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function isAuthorized(request: NextRequest): boolean {
  const isProduction = process.env.VERCEL === "1";
  if (!isProduction) return true; // In dev, always allow

  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (!cronSecret) return false;

  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  return token === cronSecret;
}

async function handleRun(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const start = Date.now();
  try {
    const result = await runNewsEnginePipeline();
    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { ok: false, error: message, durationMs: Date.now() - start },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return handleRun(request);
}

export async function POST(request: NextRequest) {
  return handleRun(request);
}
