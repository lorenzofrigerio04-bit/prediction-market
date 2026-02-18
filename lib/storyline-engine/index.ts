/**
 * Storyline Engine - BLOCCO 3
 * 
 * Questo modulo gestisce la selezione delle storyline elegibili per la generazione eventi.
 * Le storyline sono rappresentate da SourceCluster con SourceArticle collegati.
 */

import { PrismaClient } from '@prisma/client';
import { determineAuthorityFromArticles, getAuthorityType, normalizeHost } from './authority';

export interface EligibleStoryline {
  id: string;
  momentum: number;
  novelty: number;
  authority: number;
  articleCount: number;
  clusterId: string;
  authorityType: 'OFFICIAL' | 'REPUTABLE';
  authorityHost: string;
}

export interface GetEligibleStorylinesParams {
  prisma: PrismaClient;
  now: Date;
  lookbackHours: number;
}

export interface GetEligibleStorylinesResult {
  eligible: EligibleStoryline[];
  clustersLoadedCount: number;
  exclusionReasons: Record<string, number>;
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
 * Authority score 0..100 per compatibilità (percentuale articoli OFFICIAL/REPUTABLE)
 */
function calculateAuthorityScore(articles: Array<{ canonicalUrl: string }>): number {
  if (articles.length === 0) return 0;
  let officialCount = 0;
  let reputableCount = 0;
  for (const article of articles) {
    try {
      const host = normalizeHost(article.canonicalUrl);
      const t = getAuthorityType(host);
      if (t === 'OFFICIAL') officialCount++;
      else if (t === 'REPUTABLE') reputableCount++;
    } catch {
      // skip
    }
  }
  const officialRatio = officialCount / articles.length;
  const reputableRatio = reputableCount / articles.length;
  return Math.min(100, officialRatio * 100 + reputableRatio * 70);
}

/**
 * Restituisce le storyline elegibili per la generazione eventi.
 * Carica tutti i cluster con almeno un articolo nel lookback; filtra in-memory per minSignals/momentum/novelty.
 */
export async function getEligibleStorylines(
  params: GetEligibleStorylinesParams
): Promise<GetEligibleStorylinesResult> {
  const { prisma, now, lookbackHours } = params;
  
  const minSignals = parseInt(process.env.STORYLINE_MIN_SIGNALS || '2', 10);
  const minMomentum = parseInt(process.env.STORYLINE_MIN_MOMENTUM || '15', 10);
  const minNovelty = parseInt(process.env.STORYLINE_MIN_NOVELTY || '20', 10);
  const maxAgeHours = parseInt(process.env.STORYLINE_MAX_AGE_HOURS || '72', 10);
  const debug = process.env.STORYLINE_DEBUG === 'true';

  const lookbackCutoff = new Date(now.getTime() - lookbackHours * 60 * 60 * 1000);
  const maxAgeCutoff = new Date(now.getTime() - maxAgeHours * 60 * 60 * 1000);
  const exclusionReasons: Record<string, number> = {
    LOW_SIGNALS: 0,
    LOW_MOMENTUM: 0,
    LOW_NOVELTY: 0,
    TOO_OLD: 0,
    NO_ARTICLES_IN_LOOKBACK: 0,
    AUTHORITY_NONE: 0,
  };
  const authorityCounts = { OFFICIAL: 0, REPUTABLE: 0, NONE: 0 };
  const unrecognizedHosts = new Map<string, number>();

  // Carica tutti i cluster con almeno un articolo nel lookback (nessun limit/take)
  const clusters = await prisma.sourceCluster.findMany({
    where: {
      articles: {
        some: {
          fetchedAt: { gte: lookbackCutoff },
        },
      },
    },
    include: {
      articles: {
        where: { fetchedAt: { gte: lookbackCutoff } },
        orderBy: { fetchedAt: 'desc' },
      },
    },
  });

  const clustersLoadedCount = clusters.length;
  if (debug) {
    const totalClusters = await prisma.sourceCluster.count();
    console.log(`[Storyline Engine] clustersTotalCount=${totalClusters} clustersLoadedCount=${clustersLoadedCount}`);
  }

  const eligible: EligibleStoryline[] = [];

  for (const cluster of clusters) {
    const relevantArticles = cluster.articles.filter((a) => a.fetchedAt >= lookbackCutoff);

    if (relevantArticles.length < minSignals) {
      if (relevantArticles.length === 0) exclusionReasons.NO_ARTICLES_IN_LOOKBACK++;
      else exclusionReasons.LOW_SIGNALS++;
      continue;
    }

    const authorityResult = determineAuthorityFromArticles(relevantArticles);
    if (!authorityResult) {
      exclusionReasons.AUTHORITY_NONE++;
      for (const a of relevantArticles) {
        try {
          const host = normalizeHost(a.canonicalUrl);
          if (getAuthorityType(host) === 'NONE') {
            unrecognizedHosts.set(host, (unrecognizedHosts.get(host) ?? 0) + 1);
          }
        } catch {
          // skip
        }
      }
      continue;
    }
    authorityCounts[authorityResult.type]++;

    const momentum = calculateMomentum(relevantArticles, now);
    const novelty = calculateNovelty(relevantArticles, now);
    const authority = calculateAuthorityScore(relevantArticles);

    if (momentum < minMomentum) {
      exclusionReasons.LOW_MOMENTUM++;
      if (debug) {
        console.log(`[Storyline Engine] Cluster ${cluster.id} filtered: momentum=${momentum.toFixed(1)} (min=${minMomentum})`);
      }
      continue;
    }
    if (novelty < minNovelty) {
      exclusionReasons.LOW_NOVELTY++;
      if (debug) {
        console.log(`[Storyline Engine] Cluster ${cluster.id} filtered: novelty=${novelty.toFixed(1)} (min=${minNovelty})`);
      }
      continue;
    }

    eligible.push({
      id: cluster.id,
      momentum,
      novelty,
      authority,
      articleCount: relevantArticles.length,
      clusterId: cluster.id,
      authorityType: authorityResult.type,
      authorityHost: authorityResult.host,
    });
  }

  if (debug) {
    console.log(`[Storyline Engine] ${eligible.length} eligible storylines after filtering`);
    console.log(`[Storyline Engine] authority counts: OFFICIAL=${authorityCounts.OFFICIAL} REPUTABLE=${authorityCounts.REPUTABLE} NONE=${authorityCounts.NONE}`);
    const top20 = [...unrecognizedHosts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20);
    if (top20.length > 0) {
      console.log('[Storyline Engine] top 20 unrecognized hosts:', top20.map(([h, c]) => `${h}=${c}`).join(', '));
    }
  }

  return { eligible, clustersLoadedCount, exclusionReasons };
}
