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
  // When true, interleave recent articles across authors (round-robin) so the
  // homepage ticker shows a varied mix of personas instead of one author's
  // latest batch. Used by the marquee; the News page keeps pure recency order.
  const mixAuthors = searchParams.get("mixAuthors") === "true";

  try {
    // Ensure at least some content exists on first run
    await ensureMinimumContent();

    const where = {
      published: true,
      ...(format ? { format } : {}),
      ...(category ? { category } : {}),
      ...(featured ? { featured: true } : {}),
    };

    const articleSelect = {
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
    } as const;

    let articles;
    let total = 0;

    if (mixAuthors) {
      // Pull a larger recent pool, then round-robin across authors so the
      // returned list alternates personas (and, as a side effect, categories).
      const pool = await prisma.newsArticle.findMany({
        where,
        orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
        take: Math.min(240, Math.max(limit * 6, 120)),
        select: articleSelect,
      });
      total = pool.length;

      const byAuthor = new Map<string, typeof pool>();
      for (const article of pool) {
        const key = article.authorPersona ?? "—";
        const bucket = byAuthor.get(key);
        if (bucket) bucket.push(article);
        else byAuthor.set(key, [article]);
      }
      const buckets = [...byAuthor.values()];
      const mixed: typeof pool = [];
      let cursor = 0;
      while (mixed.length < limit && buckets.some((b) => b.length > 0)) {
        const bucket = buckets[cursor % buckets.length];
        const next = bucket.shift();
        if (next) mixed.push(next);
        cursor += 1;
      }
      articles = mixed;
    } else {
      [articles, total] = await Promise.all([
        prisma.newsArticle.findMany({
          where,
          orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
          skip: (page - 1) * limit,
          take: limit,
          select: articleSelect,
        }),
        prisma.newsArticle.count({ where }),
      ]);
    }

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
