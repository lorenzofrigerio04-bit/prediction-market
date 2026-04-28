import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureMinimumContent } from "@/lib/news-engine";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format"); // BREAKING | GOSSIP | ANALYTICS | REPORT | HOT_TAKE
  const category = searchParams.get("category");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20", 10));
  const featured = searchParams.get("featured") === "true";

  try {
    // Ensure at least some content exists on first run
    await ensureMinimumContent();

    const where = {
      published: true,
      ...(format ? { format } : {}),
      ...(category ? { category } : {}),
      ...(featured ? { featured: true } : {}),
    };

    const [articles, total] = await Promise.all([
      prisma.newsArticle.findMany({
        where,
        orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          slug: true,
          format: true,
          category: true,
          title: true,
          subtitle: true,
          excerpt: true,
          body: true,
          authorPersona: true,
          imageUrl: true,
          readingTimeMin: true,
          featured: true,
          publishedAt: true,
          viewCount: true,
          relatedEventId: true,
          relatedEvent: {
            select: {
              id: true,
              title: true,
              probability: true,
              status: true,
            },
          },
        },
      }),
      prisma.newsArticle.count({ where }),
    ]);

    return NextResponse.json({
      ok: true,
      articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    console.error("[api/news] Error:", error);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
