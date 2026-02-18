/**
 * Pipeline orchestrator for deterministic source ingestion
 * 
 * This orchestrator coordinates the entire ingestion process:
 * 1. Fetch data from sources (NewsAPI, RSS, Calendar)
 * 2. Extract canonical URLs
 * 3. Deduplicate by canonical URL
 * 4. Cluster similar articles using Jaccard similarity
 * 5. Save to database
 * 6. Log ingestion results
 */

import { prisma } from '@/lib/prisma';
import type {
  SourceType,
  RawArticle,
  ProcessedArticle,
  IngestionStats,
  IngestionResult,
} from '../types';

// Import processing modules (these will be implemented separately)
import { extractCanonicalUrl } from './canonical';
import { checkDuplicate, isDuplicate } from './dedup';
import { clusterArticle } from './jaccard';

// Import fetchers (these will be implemented separately)
import { fetchNewsAPI } from '../fetchers/newsapi';
import { fetchRSS } from '../fetchers/rss';
import { fetchCalendar } from '../fetchers/calendar';
import { getSourceConfigs } from '../config/sources';

/**
 * Process a single article through the pipeline
 */
async function processArticle(
  rawArticle: RawArticle,
  sourceType: SourceType,
  sourceId?: string
): Promise<ProcessedArticle | null> {
  // Step 1: Extract canonical URL
  const canonicalUrl = await extractCanonicalUrl(rawArticle.url);

  // Step 2: Check for duplicates
  const existing = await checkDuplicate(canonicalUrl);
  if (existing) {
    return null; // Skip duplicate
  }

  // Step 3: Prepare processed article
  const processedArticle: ProcessedArticle = {
    canonicalUrl,
    sourceType,
    sourceId,
    title: rawArticle.title,
    content: rawArticle.content,
    publishedAt: rawArticle.publishedAt,
    rawData: JSON.stringify(rawArticle.rawData),
  };

  // Step 4: Cluster article (assigns clusterId if similarity found)
  const clusterId = await clusterArticle(processedArticle);
  if (clusterId) {
    processedArticle.clusterId = clusterId;
  }

  return processedArticle;
}

/**
 * Save processed article to database
 */
async function saveArticle(article: ProcessedArticle): Promise<void> {
  try {
    await prisma.sourceArticle.create({
      data: {
        canonicalUrl: article.canonicalUrl,
        sourceType: article.sourceType,
        sourceId: article.sourceId,
        title: article.title,
        content: article.content,
        publishedAt: article.publishedAt,
        rawData: article.rawData,
        clusterId: article.clusterId,
      },
    });
  } catch (error: any) {
    // If it's a unique constraint violation, it means another process
    // inserted the same article concurrently - this is OK, just skip
    if (error?.code === 'P2002' && error?.meta?.target?.includes('canonicalUrl')) {
      // Duplicate detected during save (race condition) - skip silently
      return;
    }
    // Re-throw other errors
    throw error;
  }
}

/**
 * Fetch articles from a specific source type
 */
async function fetchArticlesFromSource(
  sourceType: SourceType
): Promise<RawArticle[]> {
  const configs = getSourceConfigs();

  switch (sourceType) {
    case 'NEWSAPI':
      return await fetchNewsAPI();
    case 'RSS_MEDIA':
      return await fetchRSS(
        configs.rssMediaFeeds.map((feed) => feed.url),
        'RSS_MEDIA'
      );
    case 'RSS_OFFICIAL':
      return await fetchRSS(
        configs.rssOfficialFeeds.map((feed) => feed.url),
        'RSS_OFFICIAL'
      );
    case 'CALENDAR_SPORT':
      return await fetchCalendar('SPORT');
    case 'CALENDAR_EARNINGS':
      return await fetchCalendar('EARNINGS');
    default:
      throw new Error(`Unknown source type: ${sourceType}`);
  }
}

/**
 * Process a single source type through the complete pipeline
 */
export async function processSourceType(
  sourceType: SourceType
): Promise<IngestionResult> {
  const startTime = Date.now();
  const stats: IngestionStats = {
    articlesFetched: 0,
    articlesNew: 0,
    articlesDeduped: 0,
    clustersCreated: 0,
  };

  try {
    // Step 1: Fetch articles from source
    const rawArticles = await fetchArticlesFromSource(sourceType);
    stats.articlesFetched = rawArticles.length;

    // Step 2: Process each article
    const processedArticles: ProcessedArticle[] = [];
    let clustersCreated = 0;

    for (const rawArticle of rawArticles) {
      const processed = await processArticle(
        rawArticle,
        sourceType,
        rawArticle.sourceId
      );

      if (!processed) {
        // Duplicate detected
        stats.articlesDeduped++;
        continue;
      }

      // Track if this article created a new cluster
      // A cluster is "new" if it was just created (articleCount = 1) and this is the first article being added
      if (processed.clusterId) {
        const cluster = await prisma.sourceCluster.findUnique({
          where: { id: processed.clusterId },
        });
        // Check if this is a newly created cluster (created with articleCount = 1, but no articles saved yet)
        // We check before saving, so if articleCount is 1, it means the cluster was just created
        if (cluster && cluster.articleCount === 1) {
          clustersCreated++;
        }
      }

      processedArticles.push(processed);
    }

    stats.articlesNew = processedArticles.length;
    stats.clustersCreated = clustersCreated;

    // Step 3: Save all processed articles to database
    for (const article of processedArticles) {
      await saveArticle(article);
    }

    // Step 4: Update cluster article counts
    const clusterIds = new Set<string>(
      processedArticles
        .map((a) => a.clusterId)
        .filter((id): id is string => id !== undefined)
    );

    for (const clusterId of Array.from(clusterIds)) {
      const articleCount = await prisma.sourceArticle.count({
        where: { clusterId },
      });

      await prisma.sourceCluster.update({
        where: { id: clusterId },
        data: { articleCount },
      });
    }

    const durationMs = Date.now() - startTime;

    // Step 5: Log ingestion result
    await prisma.ingestionLog.create({
      data: {
        sourceType,
        articlesFetched: stats.articlesFetched,
        articlesNew: stats.articlesNew,
        articlesDeduped: stats.articlesDeduped,
        clustersCreated: stats.clustersCreated,
        durationMs,
        success: true,
      },
    });

    return {
      success: true,
      stats,
      durationMs,
    };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    // Log error
    await prisma.ingestionLog.create({
      data: {
        sourceType,
        articlesFetched: stats.articlesFetched,
        articlesNew: stats.articlesNew,
        articlesDeduped: stats.articlesDeduped,
        clustersCreated: stats.clustersCreated,
        durationMs,
        success: false,
        errorMessage,
      },
    });

    return {
      success: false,
      stats,
      durationMs,
      errorMessage,
    };
  }
}

/**
 * Process all source types
 */
export async function processAllSources(): Promise<IngestionResult[]> {
  const sourceTypes: SourceType[] = [
    'NEWSAPI',
    'RSS_MEDIA',
    'RSS_OFFICIAL',
    'CALENDAR_SPORT',
    'CALENDAR_EARNINGS',
  ];

  const results: IngestionResult[] = [];

  // Process each source type sequentially to avoid overwhelming the system
  for (const sourceType of sourceTypes) {
    const result = await processSourceType(sourceType);
    results.push(result);
  }

  return results;
}

/**
 * Get aggregated stats from all ingestion results
 */
export function aggregateStats(
  results: IngestionResult[]
): IngestionStats & { totalDurationMs: number; successCount: number } {
  return results.reduce(
    (acc, result) => {
      acc.articlesFetched += result.stats.articlesFetched;
      acc.articlesNew += result.stats.articlesNew;
      acc.articlesDeduped += result.stats.articlesDeduped;
      acc.clustersCreated += result.stats.clustersCreated;
      acc.totalDurationMs += result.durationMs;
      if (result.success) {
        acc.successCount++;
      }
      return acc;
    },
    {
      articlesFetched: 0,
      articlesNew: 0,
      articlesDeduped: 0,
      clustersCreated: 0,
      totalDurationMs: 0,
      successCount: 0,
    }
  );
}
