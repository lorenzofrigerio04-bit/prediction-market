/**
 * Trend Detection Engine v2.0 - Type definitions
 */

export type TimeSensitivity = 'low' | 'medium' | 'high';

/** Raw signal from a SignalProvider (e.g. NewsAPI, Reddit) */
export interface RawSignal {
  providerId: string;
  sourceId?: string;
  topic: string;
  content?: string;
  publishedAt: Date;
  entities?: string[];
  category?: string;
  url?: string;
  rawData?: Record<string, unknown>;
}

/** Reference to a source signal within a TrendObject */
export interface SourceSignal {
  providerId: string;
  signalId?: string;
  timestamp: Date;
  rawData?: Record<string, unknown>;
}

/** Aggregated signals for a topic (internal) */
export interface AggregatedSignal {
  topic: string;
  category: string;
  entities: string[];
  signals: RawSignal[];
  firstSeen: Date;
  lastSeen: Date;
  providerCount: number;
}

/** Trend object output - ready for event generation or API */
export interface TrendObject {
  topic: string;
  category: string;
  entities: string[];
  trend_score: number;
  time_sensitivity: TimeSensitivity;
  source_signals: SourceSignal[];
  timestamp: Date;
  clusterId?: string;
}

/** SignalProvider interface - pluggable data sources */
export interface SignalProvider {
  readonly id: string;
  fetchSignals(options?: { limit?: number }): Promise<RawSignal[]>;
}

/** Options for getTrends() */
export interface GetTrendsParams {
  limit?: number;
  skipCache?: boolean;
}
