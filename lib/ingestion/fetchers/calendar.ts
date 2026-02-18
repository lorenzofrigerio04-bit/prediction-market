/**
 * Calendar fetcher
 * 
 * Fetches calendar events (sport and earnings).
 */

import type { RawArticle } from '../types';
import { CALENDAR_EVENTS } from '../config/sources';

/**
 * Fetch calendar events
 * 
 * @param eventType - Type of calendar events to fetch (SPORT or EARNINGS)
 * @returns Array of raw articles (calendar events as articles)
 */
export async function fetchCalendar(
  eventType: 'SPORT' | 'EARNINGS'
): Promise<RawArticle[]> {
  const events = CALENDAR_EVENTS.filter((event) => event.type === eventType);

  // Transform calendar events to RawArticle format
  // Always use calendar://event/${event.id} as URL to ensure uniqueness
  // Store sourceUrl in rawData for reference
  const articles: RawArticle[] = events.map((event) => ({
    url: `calendar://event/${event.id}`,
    title: event.title,
    content: `Calendar event: ${event.title}`,
    publishedAt: event.date,
    sourceId: `calendar-${eventType.toLowerCase()}`,
    rawData: {
      eventId: event.id,
      eventType: event.type,
      eventDate: event.date.toISOString(),
      sourceUrl: event.sourceUrl, // Store original sourceUrl in rawData
    },
  }));

  return articles;
}
