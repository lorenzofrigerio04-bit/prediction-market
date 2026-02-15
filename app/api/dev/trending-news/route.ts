import { NextRequest, NextResponse } from "next/server";
import { fetchTrendingCandidates } from "@/lib/event-sources";

export const dynamic = "force-dynamic";

/**
 * Route di test per la Fase 1: restituisce i candidati trending (notizie normalizzate).
 * Protetta da segreto: Authorization: Bearer <DEV_TRENDING_SECRET> o Bearer <CRON_SECRET>.
 * Query: ?limit=20 (default 20, max 100).
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const secret =
      process.env.DEV_TRENDING_SECRET?.trim() || process.env.CRON_SECRET?.trim();
    const isProduction = process.env.VERCEL === "1";

    if (isProduction && !secret) {
      return NextResponse.json(
        { error: "DEV_TRENDING_SECRET o CRON_SECRET non configurato" },
        { status: 503 }
      );
    }
    if (secret && authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limit = Math.min(
      100,
      Math.max(1, parseInt(request.nextUrl.searchParams.get("limit") ?? "20", 10) || 20)
    );

    const candidates = await fetchTrendingCandidates(limit);

    return NextResponse.json({
      count: candidates.length,
      candidates,
    });
  } catch (error) {
    console.error("[api/dev/trending-news]", error);
    return NextResponse.json(
      { error: "Failed to fetch trending candidates", details: String(error) },
      { status: 500 }
    );
  }
}
