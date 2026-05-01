import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminCapability } from "@/lib/admin";
import { toCreditsReadModel } from "@/lib/integration/adapters/credits-read-model-adapter";

export const dynamic = "force-dynamic";

function parsePositiveInt(raw: string | null, fallback: number): number {
  const n = Number.parseInt(raw ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/**
 * GET /api/admin/users
 * Lista utenti con paginazione (solo admin).
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdminCapability("users:read");
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parsePositiveInt(searchParams.get("page"), 1));
    const limit = Math.min(100, Math.max(1, parsePositiveInt(searchParams.get("limit"), 30)));
    const search = (searchParams.get("search") || "").trim().toLowerCase();

    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: "insensitive" as const } },
            { name: { contains: search, mode: "insensitive" as const } },
            { id: { contains: search, mode: "insensitive" as const } },
            {
              accounts: {
                some: {
                  OR: [
                    {
                      provider: {
                        contains: search,
                        mode: "insensitive" as const,
                      },
                    },
                    {
                      providerAccountId: {
                        contains: search,
                        mode: "insensitive" as const,
                      },
                    },
                  ],
                },
              },
            },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          credits: true,
          creditsMicros: true,
          createdAt: true,
          accounts: {
            select: { provider: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role || "USER",
        authProviders: [
          ...new Set(u.accounts.map((a) => a.provider).filter(Boolean)),
        ],
        credits: toCreditsReadModel({
          credits: u.credits,
          creditsMicros: u.creditsMicros,
        }).displayCredits,
        createdAt: u.createdAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "Non autenticato" || msg.includes("Accesso negato")) {
      return NextResponse.json({ error: msg }, { status: 403 });
    }
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
