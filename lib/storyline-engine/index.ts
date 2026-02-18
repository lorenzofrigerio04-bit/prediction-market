/**
 * Storyline Engine - BLOCCO 3
 * 
 * Questo modulo gestisce la selezione delle storyline elegibili per la generazione eventi.
 * Le storyline sono rappresentate da SourceCluster con SourceArticle collegati.
 */

import { PrismaClient } from '@prisma/client';
import { officialHosts, reputableHosts } from '../authority';

export interface EligibleStoryline {
  id: string;
  momentum: number; // 0..100
  novelty: number; // 0..100
  authority: number; // 0..100
  articleCount: number;
  clusterId: string;
}

export interface GetEligibleStorylinesParams {
  prisma: PrismaClient;
  now: Date;
  lookbackHours: number;
}

/**
 * Calcola il momentum di un cluster basato sulla velocità di crescita
 * Momentum = velocità di aggiunta articoli nel tempo (0..100)
 */
function calculateMomentum(
  articles: Array<{ publishedAt: Date | null; fetchedAt: Date }>,
  now: Date
): number {
  if (articles.length === 0) return 0;
  if (articles.length === 1) return 10; // Base score per cluster singolo

  // Ordina articoli per data (più vecchio -> più recente)
  const sortedArticles = [...articles].sort((a, b) => {
    const dateA = a.publishedAt || a.fetchedAt;
    const dateB = b.publishedAt || b.fetchedAt;
    return dateA.getTime() - dateB.getTime();
  });

  // Calcola intervalli tra articoli consecutivi
  const intervals: number[] = [];
  for (let i = 1; i < sortedArticles.length; i++) {
    const prevDate = sortedArticles[i - 1].publishedAt || sortedArticles[i - 1].fetchedAt;
    const currDate = sortedArticles[i].publishedAt || sortedArticles[i].fetchedAt;
    const intervalHours = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60);
    intervals.push(intervalHours);
  }

  // Momentum inversamente proporzionale all'intervallo medio
  // Cluster con articoli aggiunti rapidamente hanno momentum alto
  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  
  // Normalizza: intervalli brevi (< 6h) = momentum alto, intervalli lunghi (> 72h) = momentum basso
  // Formula: momentum = 100 * (1 - min(avgInterval / 72, 1))
  const momentum = Math.max(0, Math.min(100, 100 * (1 - Math.min(avgInterval / 72, 1))));
  
  // Bonus per numero di articoli (più articoli = più momentum)
  const countBonus = Math.min(30, articles.length * 2);
  
  return Math.min(100, momentum + countBonus);
}

/**
 * Calcola la novelty di un cluster basata sulla freschezza
 * Novelty = quanto recente è il cluster (0..100)
 */
function calculateNovelty(
  articles: Array<{ publishedAt: Date | null; fetchedAt: Date }>,
  now: Date
): number {
  if (articles.length === 0) return 0;

  // Trova l'articolo più recente
  const latestArticle = articles.reduce((latest, article) => {
    const articleDate = article.publishedAt || article.fetchedAt;
    const latestDate = latest.publishedAt || latest.fetchedAt;
    return articleDate > latestDate ? article : latest;
  });

  const latestDate = latestArticle.publishedAt || latestArticle.fetchedAt;
  const hoursAgo = (now.getTime() - latestDate.getTime()) / (1000 * 60 * 60);

  // Novelty decresce con il tempo: 0h = 100, 72h = 0
  const novelty = Math.max(0, Math.min(100, 100 * (1 - hoursAgo / 72)));
  
  return novelty;
}

/**
 * Calcola l'authority di un cluster basata sulle fonti
 * Authority = percentuale di articoli da fonti ufficiali/reputabili (0..100)
 */
function calculateAuthority(articles: Array<{ canonicalUrl: string }>): number {
  if (articles.length === 0) return 0;

  let officialCount = 0;
  let reputableCount = 0;

  for (const article of articles) {
    try {
      const url = new URL(article.canonicalUrl);
      const host = url.hostname.toLowerCase();
      
      if (officialHosts.some(h => host.includes(h.toLowerCase()))) {
        officialCount++;
      } else if (reputableHosts.some(h => host.includes(h.toLowerCase()))) {
        reputableCount++;
      }
    } catch {
      // Skip invalid URLs
    }
  }

  // Authority: 100% per tutti ufficiali, 70% per tutti reputabili, mix proporzionale
  const officialRatio = officialCount / articles.length;
  const reputableRatio = reputableCount / articles.length;
  const authority = officialRatio * 100 + reputableRatio * 70;
  
  return Math.min(100, authority);
}

/**
 * Restituisce le storyline elegibili per la generazione eventi.
 * 
 * @param params Parametri per la query
 * @returns Array di storyline elegibili con momentum e novelty
 */
export async function getEligibleStorylines(
  params: GetEligibleStorylinesParams
): Promise<EligibleStoryline[]> {
  const { prisma, now, lookbackHours } = params;
  
  const minSignals = parseInt(process.env.STORYLINE_MIN_SIGNALS || '3', 10);
  const minMomentum = parseInt(process.env.STORYLINE_MIN_MOMENTUM || '15', 10);
  const minNovelty = parseInt(process.env.STORYLINE_MIN_NOVELTY || '20', 10);
  const maxAgeHours = parseInt(process.env.STORYLINE_MAX_AGE_HOURS || '72', 10);
  const debug = process.env.STORYLINE_DEBUG === 'true';

  // Calcola cutoff date per lookback
  const lookbackCutoff = new Date(now.getTime() - lookbackHours * 60 * 60 * 1000);
  const maxAgeCutoff = new Date(now.getTime() - maxAgeHours * 60 * 60 * 1000);

  // Query clusters con articoli nel lookback window
  const clusters = await prisma.sourceCluster.findMany({
    where: {
      articles: {
        some: {
          fetchedAt: {
            gte: lookbackCutoff,
          },
        },
      },
      // Filtra per numero minimo di articoli
      articleCount: {
        gte: minSignals,
      },
    },
    include: {
      articles: {
        where: {
          fetchedAt: {
            gte: maxAgeCutoff, // Solo articoli recenti per calcolo momentum/novelty
          },
        },
        orderBy: {
          fetchedAt: 'desc',
        },
      },
    },
  });

  if (debug) {
    console.log(`[Storyline Engine] Loaded ${clusters.length} clusters from DB`);
  }

  const eligible: EligibleStoryline[] = [];

  for (const cluster of clusters) {
    // Filtra articoli nel lookback window per calcoli
    const relevantArticles = cluster.articles.filter(
      article => article.fetchedAt >= lookbackCutoff
    );

    if (relevantArticles.length < minSignals) {
      continue;
    }

    // Calcola metriche
    const momentum = calculateMomentum(relevantArticles, now);
    const novelty = calculateNovelty(relevantArticles, now);
    const authority = calculateAuthority(relevantArticles);

    // Filtra per soglie minime
    if (momentum < minMomentum || novelty < minNovelty) {
      if (debug) {
        console.log(
          `[Storyline Engine] Cluster ${cluster.id} filtered: ` +
          `momentum=${momentum.toFixed(1)} (min=${minMomentum}), ` +
          `novelty=${novelty.toFixed(1)} (min=${minNovelty})`
        );
      }
      continue;
    }

    eligible.push({
      id: cluster.id,
      momentum,
      novelty,
      authority,
      articleCount: cluster.articleCount,
      clusterId: cluster.id,
    });
  }

  if (debug) {
    console.log(`[Storyline Engine] ${eligible.length} eligible storylines after filtering`);
  }

  return eligible;
}
