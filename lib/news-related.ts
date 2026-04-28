import type { NewsFormat } from "@/lib/news-engine/types";
import { prisma } from "@/lib/prisma";

export type RelatedNewsArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  format: string;
  authorPersona: string;
  publishedAt: Date;
  readingTimeMin: number;
};

const selectRelated = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  body: true,
  format: true,
  authorPersona: true,
  category: true,
  publishedAt: true,
  readingTimeMin: true,
} as const;

function relevanceScore(
  row: { category: string; format: string; authorPersona: string },
  current: { category: string; format: string; authorPersona: string }
): number {
  let s = 0;
  if (row.category === current.category) s += 4;
  if (row.format === current.format) s += 2;
  if (row.authorPersona === current.authorPersona) s += 2;
  return s;
}

/** Fino a `limit` articoli correlati per categoria, formato e autore; poi riempie con i più recenti. */
export async function getRelatedNewsArticles(
  current: {
    id: string;
    category: string;
    format: string;
    authorPersona: string;
  },
  limit = 5
): Promise<RelatedNewsArticle[]> {
  const candidates = await prisma.newsArticle.findMany({
    where: {
      published: true,
      id: { not: current.id },
      OR: [
        { category: current.category },
        { format: current.format },
        { authorPersona: current.authorPersona },
      ],
    },
    select: selectRelated,
    orderBy: { publishedAt: "desc" },
    take: 48,
  });

  const sorted = [...candidates].sort((a, b) => {
    const d = relevanceScore(b, current) - relevanceScore(a, current);
    if (d !== 0) return d;
    return b.publishedAt.getTime() - a.publishedAt.getTime();
  });

  const seen = new Set<string>();
  const result: RelatedNewsArticle[] = [];

  for (const row of sorted) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    result.push({
      id: row.id,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      body: row.body,
      format: row.format,
      authorPersona: row.authorPersona,
      publishedAt: row.publishedAt,
      readingTimeMin: row.readingTimeMin,
    });
    if (result.length >= limit) return result;
  }

  const excludeIds = [current.id, ...result.map((r) => r.id)];
  const need = limit - result.length;
  if (need <= 0) return result;

  const filler = await prisma.newsArticle.findMany({
    where: {
      published: true,
      id: { notIn: excludeIds },
    },
    select: selectRelated,
    orderBy: { publishedAt: "desc" },
    take: need,
  });

  for (const row of filler) {
    result.push({
      id: row.id,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      body: row.body,
      format: row.format,
      authorPersona: row.authorPersona,
      publishedAt: row.publishedAt,
      readingTimeMin: row.readingTimeMin,
    });
  }

  return result;
}

export function relatedArticleToSerializable(a: RelatedNewsArticle) {
  return {
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    body: a.body,
    format: a.format as NewsFormat,
    authorPersona: a.authorPersona,
    publishedAt: a.publishedAt.toISOString(),
    readingTimeMin: a.readingTimeMin,
  };
}
