import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

/**
 * GET /api/admin/audit
 * Tabella AuditLog con filtri (userId, action, entityType, page, limit) e paginazione
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const userId = searchParams.get("userId") || undefined;
    const action = searchParams.get("action") || undefined;
    const entityType = searchParams.get("entityType") || undefined;

    const where: { userId?: string; action?: string; entityType?: string } = {};
    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.auditLog.count({ where }),
    ]);

    const userIds = [...new Set(logs.map((l) => l.userId).filter(Boolean))] as string[];
    const users =
      userIds.length > 0
        ? await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true, email: true },
          })
        : [];
    const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

    const rows = logs.map((log) => ({
      ...log,
      user: log.userId ? userMap[log.userId] ?? null : null,
    }));

    return NextResponse.json({
      logs: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    if (error.message === "Non autenticato" || error.message?.includes("Accesso negato")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
