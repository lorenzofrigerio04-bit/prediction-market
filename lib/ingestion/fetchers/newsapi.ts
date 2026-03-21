/**
 * NewsAPI.ai / Event Registry fetcher
 *
 * Fetches articles from NewsAPI.ai (Event Registry) service.
 * API: GET https://eventregistry.org/api/v1/article/getArticles
 * Fallback: api.newsapi.ai (same backend, different domain)
 */

import type { RawArticle } from '../types';

const NEWSAPI_API_KEY = process.env.NEWSAPI_API_KEY;

const EVENT_REGISTRY_BASE = 'https://eventregistry.org/api/v1';
const NEWSAPI_AI_BASE = 'https://api.newsapi.ai/v1';

function getBaseUrl(): string {
  return process.env.NEWSAPI_USE_EVENT_REGISTRY === 'true'
    ? EVENT_REGISTRY_BASE
    : NEWSAPI_AI_BASE;
}

/**
 * Fetch articles from NewsAPI.ai / Event Registry
 *
 * @returns Array of raw articles
 */
export async function fetchNewsAPI(): Promise<RawArticle[]> {
  if (!NEWSAPI_API_KEY) {
    console.warn('NEWSAPI_API_KEY not configured, skipping NewsAPI fetch');
    return [];
  }

  try {
    const baseUrl = getBaseUrl();
    const url = new URL('article/getArticles', baseUrl);
    url.searchParams.set('apiKey', NEWSAPI_API_KEY);
    url.searchParams.set('resultType', 'articles');
    url.searchParams.set('articlesCount', '50');
    url.searchParams.set('articlesSortBy', 'date');

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'IngestionBot/1.0',
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error(`NewsAPI request failed: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as Record<string, unknown>;
    const articlesRaw = data.articles;
    const articlesArray = Array.isArray(articlesRaw)
      ? articlesRaw
      : (articlesRaw != null && typeof articlesRaw === 'object' && 'results' in articlesRaw
          ? (articlesRaw as { results: unknown[] }).results
          : []) as unknown[];

    const articles: RawArticle[] = [];
    for (const item of articlesArray) {
      const i = item as Record<string, unknown>;
      const urlVal = (i.url ?? i.link ?? '') as string;
      const title = (i.title ?? '') as string;
      if (!urlVal || !title) continue;
      const publishedAt = i.publishedAt
        ? new Date(i.publishedAt as string)
        : i.dateTime
          ? new Date(i.dateTime as string)
          : undefined;
      articles.push({
        url: urlVal,
        title,
        content: (i.body ?? i.description ?? i.content ?? '') as string,
        publishedAt,
        sourceId: 'newsapi',
        rawData: i as Record<string, unknown>,
      });
    }

    return articles;
  } catch (error) {
    console.error('Error fetching from NewsAPI:', error);
    return [];
  }
}
