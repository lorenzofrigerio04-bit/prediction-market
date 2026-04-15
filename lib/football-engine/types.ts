/**
 * Tipi condivisi del Football Intelligence Engine.
 * Tutti i layer (RADAR, BRAIN, FORGE, SENTINEL) usano questi tipi.
 */

// ---------------------------------------------------------------------------
// Enums & IDs
// ---------------------------------------------------------------------------

export type CompetitionTier = 1 | 2 | 3 | 4;

export interface Competition {
  id: string;
  name: string;
  country: string;
  tier: CompetitionTier;
  /** ID su football-data.org (es. "SA") */
  footballDataCode?: string;
  /** ID su API-Football (es. 135 = Serie A) */
  apiFootballId?: number;
  /** Slug per The Odds API (es. "soccer_italy_serie_a") */
  oddsApiKey?: string;
}

// ---------------------------------------------------------------------------
// Signal — unità atomica di informazione dal RADAR
// ---------------------------------------------------------------------------

export type SignalType =
  | "fixture"
  | "result"
  | "lineup"
  | "injury"
  | "suspension"
  | "transfer_rumor"
  | "transfer_official"
  | "coach_change"
  | "player_stats"
  | "team_stats"
  | "standings"
  | "h2h"
  | "live_event"
  | "odds"
  | "odds_movement"
  | "news"
  | "social"
  | "press_conference"
  | "referee_assignment"
  | "var_incident"
  | "discipline";

export type SignalSourceId =
  | "football-data-org"
  | "api-football"
  | "odds-api"
  | "newsapi"
  | "google-news-rss"
  | "reddit"
  | "twitter"
  | "apify"
  | "youtube"
  | "manual";

export type SourceTier = 1 | 2 | 3;

export interface SignalSource {
  id: SignalSourceId;
  tier: SourceTier;
  name: string;
  /** Reliability 0-1 */
  reliability: number;
}

export interface FootballSignal {
  id: string;
  type: SignalType;
  source: SignalSource;
  /** ISO timestamp */
  timestamp: string;
  /** Free-form title/headline */
  headline: string;
  /** Longer text content */
  content?: string;
  /** URL to original source for resolution/verification */
  sourceUrl?: string;
  /** Confidence in the accuracy of this signal (0-1) */
  confidence: number;

  // Contextual references
  competitionId?: string;
  matchId?: string;
  /** API-Football match ID */
  apiFootballMatchId?: number;
  /** football-data.org match ID */
  footballDataMatchId?: number;
  teamIds?: string[];
  playerIds?: string[];

  /** Arbitrary structured payload depending on signal type */
  payload: Record<string, unknown>;

  /** Tags for filtering/routing */
  tags: string[];
}

// ---------------------------------------------------------------------------
// Match — unified match representation
// ---------------------------------------------------------------------------

export type MatchStatus =
  | "SCHEDULED"
  | "TIMED"
  | "IN_PLAY"
  | "HALFTIME"
  | "PAUSED"
  | "EXTRA_TIME"
  | "PENALTY"
  | "FINISHED"
  | "FINISHED_AET"
  | "FINISHED_PEN"
  | "SUSPENDED"
  | "POSTPONED"
  | "CANCELLED"
  | "NOT_STARTED";

export interface MatchTeam {
  id: string;
  name: string;
  shortName?: string;
  logo?: string;
}

export interface MatchScore {
  home: number | null;
  away: number | null;
}

export interface Match {
  id: string;
  apiFootballId?: number;
  footballDataId?: number;
  competition: Competition;
  homeTeam: MatchTeam;
  awayTeam: MatchTeam;
  status: MatchStatus;
  /** ISO date */
  utcDate: string;
  /** Venue name */
  venue?: string;
  referee?: string;
  score?: {
    fullTime?: MatchScore;
    halfTime?: MatchScore;
    extraTime?: MatchScore;
    penalty?: MatchScore;
  };
}

// ---------------------------------------------------------------------------
// Player & Team enrichment
// ---------------------------------------------------------------------------

export interface PlayerInfo {
  id: string;
  apiFootballId?: number;
  name: string;
  position?: string;
  nationality?: string;
  team?: { id: string; name: string };
  injured?: boolean;
  injuryType?: string;
  suspended?: boolean;
  photo?: string;
}

export interface TeamStanding {
  teamId: string;
  teamName: string;
  position: number;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  form?: string;
}

export interface HeadToHead {
  totalMatches: number;
  homeWins: number;
  awayWins: number;
  draws: number;
  recentMatches: Array<{
    date: string;
    homeTeam: string;
    awayTeam: string;
    homeGoals: number;
    awayGoals: number;
    competition: string;
  }>;
}

// ---------------------------------------------------------------------------
// Odds
// ---------------------------------------------------------------------------

export interface OddsMarket {
  bookmaker: string;
  market: string;
  lastUpdate: string;
  outcomes: Array<{
    name: string;
    price: number;
  }>;
}

export interface MatchOdds {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  commenceTime: string;
  markets: OddsMarket[];
}

// ---------------------------------------------------------------------------
// RADAR output — aggregated context for a match or topic
// ---------------------------------------------------------------------------

export interface MatchContext {
  match: Match;
  signals: FootballSignal[];
  odds?: MatchOdds;
  h2h?: HeadToHead;
  homeStanding?: TeamStanding;
  awayStanding?: TeamStanding;
  homeInjuries: PlayerInfo[];
  awayInjuries: PlayerInfo[];
  homeLineup?: PlayerInfo[];
  awayLineup?: PlayerInfo[];
  /** Overall "interest score" 0-100 based on signal density, odds movement, etc. */
  interestScore: number;
  /** Dominant narrative themes extracted from signals */
  themes: string[];
}

export interface RadarOutput {
  timestamp: string;
  matches: MatchContext[];
  /** Non-match signals (transfers, coach sackings, general news) */
  floatingSignals: FootballSignal[];
}
