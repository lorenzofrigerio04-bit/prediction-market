export interface FootballEvent {
  id: string;
  title: string;
  category: string;
  closesAt: string;
  createdAt: string;
  yesPct: number;
  predictionsCount: number;
  totalCredits: number;
  aiImageUrl?: string | null;
  marketType?: string | null;
  outcomes?: Array<{ key: string; label: string }> | null;
  outcomeProbabilities?: Array<{ key: string; label: string; probabilityPct: number }> | null;
  isFie?: boolean;
  matchStatus?: string | null;
  realWorldEventTime?: string | null;
  sportLeague?: string | null;
}

export interface CalendarDay {
  dateKey: string; // YYYY-MM-DD
  dateLabel: string; // "Mercoledì 24 Aprile"
  events: FootballEvent[];
}

export interface FootballHomepagePayload {
  liveEvents: FootballEvent[];
  topEvents: FootballEvent[];
  popularMarkets: FootballEvent[];
  forYouMarkets: FootballEvent[];
  uniqueMarkets: FootballEvent[];
  calendar: CalendarDay[];
  /** Top 5 events of the last 24h by engagement score */
  top24hEvents: FootballEvent[];
  /** Viral events — highest engagement velocity */
  viralEvents: FootballEvent[];
  /** Events expiring soon (next 48h) */
  expiringEvents: FootballEvent[];
  /** True when the sport 2.0 pipeline has no events (dev/empty DB) */
  isEmpty: boolean;
  /** True when forYouMarkets are personalized (user has prediction history) */
  isPersonalized: boolean;
}
