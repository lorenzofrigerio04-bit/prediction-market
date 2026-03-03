import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export interface OracleReportItem {
  id: string;
  userQuery: string;
  reportText: string;
  topic: string | null;
  createdAt: string;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(
      parseInt(searchParams.get("limit") ?? "20", 10) || 20,
      50
    );
    const cursor = searchParams.get("cursor") ?? undefined;

    const chat = await prisma.oracleChat.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });

    if (!chat) {
      return NextResponse.json({
        reports: [],
        nextCursor: null,
      });
    }

    const reports = await prisma.oracleReport.findMany({
      where: { chatId: chat.id },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = reports.length > limit;
    const items = hasMore ? reports.slice(0, limit) : reports;
    const nextCursor = hasMore ? items[items.length - 1]?.id ?? null : null;

    const result: OracleReportItem[] = items.map((r) => ({
      id: r.id,
      userQuery: r.userQuery,
      reportText: r.reportText,
      topic: r.topic,
      createdAt: r.createdAt.toISOString(),
    }));

    return NextResponse.json({
      reports: result,
      nextCursor,
    });
  } catch (err) {
    console.error("Oracle reports error:", err);
    return NextResponse.json(
      { error: "Errore nel caricamento dei report" },
      { status: 500 }
    );
  }
}
