/**
 * Types for ingestion pipeline
 */

export type SourceType =
  | 'NEWSAPI'
  | 'RSS_MEDIA'
  | 'RSS_OFFICIAL'
  | 'CALENDAR_SPORT'
  | 'CALENDAR_EARNINGS';

export interface RawArticle {
  url: string;
  title: string;
  content?: string;
  publishedAt?: Date;
  sourceId?: string;
  rawData: Record<string, unknown>;
}

export interface ProcessedArticle {
  canonicalUrl: string;
  sourceType: SourceType;
  sourceId?: string;
  title: string;
  content?: string;
  publishedAt?: Date;
  rawData: string; // JSON string
  clusterId?: string;
}

export interface IngestionStats {
  articlesFetched: number;
  articlesNew: number;
  articlesDeduped: number;
  clustersCreated: number;
}

export interface IngestionResult {
  success: boolean;
  stats: IngestionStats;
  errorMessage?: string;
  durationMs: number;
}
