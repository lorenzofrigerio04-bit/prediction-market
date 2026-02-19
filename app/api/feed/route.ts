import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/feed
 * Feed eventi per utente loggato (limit, offset). Se non loggato: 401.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10) || 20, 50);
    const offset = Math.max(0, parseInt(searchParams.get("offset") || "0", 10) || 0);
    const now = new Date();

    const where = {
      resolved: false,
      closesAt: { gt: now },
      category: { not: "News" as const },
      NOT: { createdBy: { email: "event-generator@system" } },
    };

    const [items, total] = await Promise.all([
      prisma.event.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          createdAt: true,
          closesAt: true,
          probability: true,
          totalCredits: true,
          resolved: true,
          outcome: true,
        },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.event.count({ where }),
    ]);

    return NextResponse.json({
      items,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + items.length < total,
      },
    });
  } catch (error) {
    console.error("Feed error:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento del feed" },
      { status: 500 }
    );
  }
}
