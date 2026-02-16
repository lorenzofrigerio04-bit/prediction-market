/**
 * Health check: DB connectivity and events count.
 * GET /api/health — no auth. Use to verify dbConnected and markets_count (events).
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  let dbConnected = false;
  let markets_count = 0;
  let error: string | null = null;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbConnected = true;
    markets_count = await prisma.event.count();
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json({
    ok: dbConnected,
    dbConnected,
    markets_count,
    ...(error != null ? { error } : {}),
  });
}
