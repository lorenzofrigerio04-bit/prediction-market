/**
 * TypeScript types for Events with FOMO statistics
 */

import type { EventFomoStats } from "@/lib/fomo/event-stats";

/**
 * Evento con statistiche FOMO incluse
 */
export interface EventWithFomo {
  id: string;
  title: string;
  description: string | null;
  category: string;
  createdAt: string;
  closesAt: string;
  resolved: boolean;
  outcome: string | null;
  probability: number;
  yesCredits: number;
  noCredits: number;
  totalCredits: number;
  createdBy: {
    id: string;
    name: string | null;
    image: string | null;
  };
  _count: {
    predictions: number;
    comments: number;
  };
  /** Statistiche FOMO */
  fomo: EventFomoStats;
}

/**
 * Response da API events
 */
export interface EventsResponse {
  events: EventWithFomo[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Response da API closing-soon o trending-now
 */
export interface EventsListResponse {
  events: EventWithFomo[];
  count: number;
}
