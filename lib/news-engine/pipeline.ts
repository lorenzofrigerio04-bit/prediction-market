/**
 * News Engine Pipeline — orchestratore principale.
 * Coordina fetch → enrichment → persistenza.
 */

import { prisma } from "@/lib/prisma";
import { fetchAllNewsInputs } from "./fetcher";
import { enrichArticle, planEnrichmentQueue } from "./enricher";
import type { NewsEngineResult } from "./types";
import { getPublicSourceLabelFromUrls } from "./public-source";

const DISABLE_OPENAI = process.env.DISABLE_OPENAI === "true";

/** Compila source_label sugli articoli già in DB (deriva da source_urls). Idempotente. */
export async function syncNewsArticleSourceLabels(): Promise<void> {
  const articles = await prisma.newsArticle.findMany({
    where: { OR: [{ sourceLabel: null }, { sourceLabel: "" }] },
    select: { id: true, sourceUrls: true },
    take: 400,
  });
  for (const a of articles) {
    const label = getPublicSourceLabelFromUrls(a.sourceUrls);
    await prisma.newsArticle.update({
      where: { id: a.id },
      data: { sourceLabel: label },
    });
  }
}

/** Verifica se un articolo è già stato processato */
async function isAlreadyProcessed(sourceHash: string): Promise<boolean> {
  const existing = await prisma.newsArticle.findUnique({
    where: { sourceHash },
    select: { id: true },
  });
  return existing !== null;
}

/** Salva un articolo arricchito nel DB */
async function saveArticle(article: Awaited<ReturnType<typeof enrichArticle>>) {
  if (!article) return;
  await prisma.newsArticle.upsert({
    where: { slug: article.slug },
    create: {
      slug: article.slug,
      format: article.format,
      category: article.category,
      title: article.title,
      subtitle: article.subtitle || null,
      body: article.body,
      excerpt: article.excerpt,
      authorPersona: article.authorPersona,
      sourceUrls: article.sourceUrls,
      sourceLabel: article.sourceLabel,
      relatedEventId: article.relatedEventId ?? null,
      imageUrl: article.imageUrl ?? null,
      readingTimeMin: article.readingTimeMin,
      featured: article.featured,
      published: true,
      sourceHash: article.sourceHash,
    },
    update: {
      viewCount: { increment: 0 },
    },
  });
}

/** Pipeline principale */
export async function runNewsEnginePipeline(): Promise<NewsEngineResult> {
  const start = Date.now();
  let generated = 0;
  let skipped = 0;
  let errors = 0;

  if (DISABLE_OPENAI) {
    console.warn("[news-engine] DISABLE_OPENAI=true, pipeline aborted");
    return { generated: 0, skipped: 0, errors: 0, durationMs: Date.now() - start };
  }

  console.log("[news-engine] Starting pipeline...");

  const { general, platform } = await fetchAllNewsInputs();
  console.log(`[news-engine] Fetched: ${general.length} general, ${platform.length} platform`);

  const queue = planEnrichmentQueue(general, platform);
  console.log(`[news-engine] Processing ${queue.length} articles`);

  // Process sequentially to avoid rate limits
  for (const item of queue) {
    try {
      const hash = require("crypto")
        .createHash("sha256")
        .update(item.input.url + item.input.title)
        .digest("hex")
        .slice(0, 32);

      const alreadyDone = await isAlreadyProcessed(hash);
      if (alreadyDone) {
        skipped++;
        continue;
      }

      const enriched = await enrichArticle(item.input, item.format, item.isPlatform);
      if (!enriched) {
        errors++;
        continue;
      }

      await saveArticle(enriched);
      generated++;

      // Piccola pausa tra le richieste per evitare rate limiting
      await new Promise((r) => setTimeout(r, 300));
    } catch (err) {
      console.error("[news-engine] Error processing article:", err);
      errors++;
    }
  }

  // Mantieni solo gli ultimi 200 articoli per non appesantire il DB
  try {
    const countResult = await prisma.newsArticle.count();
    if (countResult > 200) {
      const oldest = await prisma.newsArticle.findMany({
        orderBy: { publishedAt: "asc" },
        take: countResult - 200,
        select: { id: true },
      });
      await prisma.newsArticle.deleteMany({
        where: { id: { in: oldest.map((o) => o.id) } },
      });
    }
  } catch {
    // Non bloccare il pipeline per questo
  }

  const result: NewsEngineResult = {
    generated,
    skipped,
    errors,
    durationMs: Date.now() - start,
  };

  console.log("[news-engine] Pipeline complete:", result);
  return result;
}

/** Genera contenuto di fallback se non ci sono articoli nel DB */
export async function ensureMinimumContent(): Promise<void> {
  await syncNewsArticleSourceLabels();

  const count = await prisma.newsArticle.count({ where: { published: true } });
  if (count >= 5) return;

  // Articoli di esempio per non mostrare la pagina vuota al primo avvio
  const seedArticles = [
    {
      slug: "welcome-news-section-calcio",
      format: "BREAKING",
      category: "serie-a",
      title: "La Sezione News è Online — Tutto il Calcio che Conta",
      subtitle: "Breaking news, gossip, analisi e hot takes ogni giorno",
      body: "La nuova sezione News di PredictionMaster è finalmente live. Qui troverai le ultime notizie dal mondo del calcio: breaking news in tempo reale, gossip di mercato, analisi tattiche approfondite, report basati sui dati della piattaforma e hot takes che faranno discutere.\n\nLa redazione segue le principali fonti sportive e aggiorna la sezione con regolarità. Troverai anche insight legati all'attività della nostra community sulle scommesse.",
      excerpt: "La nuova sezione News è live — breaking news, gossip e analisi esclusive sul calcio che ami.",
      authorPersona: "Redazione",
      sourceUrls: [],
      sourceLabel: "Redazione PredictionMaster",
      readingTimeMin: 1,
      featured: true,
      published: true,
      sourceHash: "welcome-seed-001",
    },
  ];

  for (const article of seedArticles) {
    try {
      await prisma.newsArticle.upsert({
        where: { slug: article.slug },
        create: article,
        update: {
          title: article.title,
          subtitle: article.subtitle,
          body: article.body,
          excerpt: article.excerpt,
          sourceLabel: article.sourceLabel,
        },
      });
    } catch {
      // Già presente
    }
  }
}
