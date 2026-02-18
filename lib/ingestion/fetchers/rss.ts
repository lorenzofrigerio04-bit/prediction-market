/**
 * RSS fetcher
 * 
 * Fetches articles from RSS feeds.
 */

import Parser from 'rss-parser';
import type { RawArticle } from '../types';
import https from 'https';

// In development, disable SSL certificate verification for RSS feeds
// This is needed because some RSS feeds have certificate issues
// In production, this should be properly configured with valid certificates
const httpsAgent = new https.Agent({
  rejectUnauthorized: process.env.NODE_ENV === 'production',
});

const parser = new Parser({
  timeout: 10000,
  customFields: {
    item: ['content:encoded', 'media:content'],
  },
  requestOptions: {
    agent: httpsAgent,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; RSSBot/1.0)',
    },
  },
});

/**
 * Fetch articles from RSS feeds
 * 
 * @param feedUrls - Array of RSS feed URLs
 * @param sourceType - Source type for tracking (RSS_MEDIA or RSS_OFFICIAL)
 * @returns Array of raw articles
 */
export async function fetchRSS(
  feedUrls: string[],
  sourceType: 'RSS_MEDIA' | 'RSS_OFFICIAL'
): Promise<RawArticle[]> {
  const articles: RawArticle[] = [];

  for (const feedUrl of feedUrls) {
    try {
      const feed = await parser.parseURL(feedUrl);

      for (const item of feed.items || []) {
        if (!item.link || !item.title) {
          continue; // Skip items without required fields
        }

        articles.push({
          url: item.link,
          title: item.title,
          content: item.contentSnippet || item.content || (item as any).description || '',
          publishedAt: item.pubDate ? new Date(item.pubDate) : undefined,
          sourceId: feedUrl,
          rawData: {
            feedTitle: feed.title,
            feedDescription: feed.description,
            itemGuid: item.guid,
            itemCategories: item.categories,
            itemCreator: item.creator,
            itemContent: item.content,
            itemContentSnippet: item.contentSnippet,
          },
        });
      }
    } catch (error) {
      console.error(`Error fetching RSS feed ${feedUrl}:`, error);
      // Continue with other feeds even if one fails
    }
  }

  return articles;
}
