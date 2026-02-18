/**
 * NewsAPI.ai fetcher
 * 
 * Fetches articles from NewsAPI.ai service.
 */

import type { RawArticle } from '../types';

const NEWSAPI_API_KEY = process.env.NEWSAPI_API_KEY;

/**
 * Fetch articles from NewsAPI.ai
 * 
 * @returns Array of raw articles
 */
export async function fetchNewsAPI(): Promise<RawArticle[]> {
  if (!NEWSAPI_API_KEY) {
    console.warn('NEWSAPI_API_KEY not configured, skipping NewsAPI fetch');
    return [];
  }

  try {
    // TODO: Implement actual NewsAPI.ai integration
    // This is a placeholder implementation
    const response = await fetch(
      `https://api.newsapi.ai/v1/article/getArticles?apiKey=${NEWSAPI_API_KEY}`,
      {
        headers: {
          'User-Agent': 'IngestionBot/1.0',
        },
        signal: AbortSignal.timeout(30000), // 30 second timeout
      }
    );

    if (!response.ok) {
      throw new Error(`NewsAPI request failed: ${response.statusText}`);
    }

    const data = await response.json();

    // Transform NewsAPI response to RawArticle format
    // TODO: Adapt this to actual NewsAPI.ai response structure
    const articles: RawArticle[] = (data.articles || []).map((item: any) => ({
      url: item.url || item.link || '',
      title: item.title || '',
      content: item.description || item.content || '',
      publishedAt: item.publishedAt
        ? new Date(item.publishedAt)
        : undefined,
      sourceId: 'newsapi',
      rawData: item,
    }));

    return articles.filter((article) => article.url && article.title);
  } catch (error) {
    console.error('Error fetching from NewsAPI:', error);
    return [];
  }
}
