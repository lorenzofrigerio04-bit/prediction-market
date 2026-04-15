/**
 * API-Football (api-sports.io) client — v3.
 * Docs: https://www.api-football.com/documentation-v3
 *
 * Provides: fixtures, lineups, player stats, injuries, transfers,
 * live events (minute-by-minute), H2H, standings, top scorers.
 *
 * Env: API_FOOTBALL_KEY (from dashboard.api-football.com)
 * Rate limit free tier: 100 req/day, 10 req/min
 */

const BASE_URL = "https://v3.football.api-sports.io";

function getApiKey(): string {
  const key = process.env.API_FOOTBALL_KEY?.trim();
  if (!key) {
    throw new Error("API_FOOTBALL_KEY not configured. Get one at https://dashboard.api-football.com/");
  }
  return key;
}

async function apiFetch<T>(endpoint: string, params: Record<string, string | number>): Promise<T> {
  const url = new URL(endpoint, BASE_URL);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }

  const res = await fetch(url.toString(), {
    headers: {
      "x-apisports-key": getApiKey(),
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API-Football ${endpoint}: ${res.status} ${res.statusText} - ${text.slice(0, 300)}`);
  }

  const data = await res.json();
  return data as T;
}

// ---------------------------------------------------------------------------
// Response shapes (only the fields we use)
// ---------------------------------------------------------------------------

interface ApiResponse<T> {
  get: string;
  parameters: Record<string, string>;
  errors: Record<string, string> | unknown[];
  results: number;
  paging: { current: number; total: number };
  response: T[];
}

// --- Fixtures ---

export interface ApiFixture {
  fixture: {
    id: number;
    referee: string | null;
    timezone: string;
    date: string;
    timestamp: number;
    venue: { id: number | null; name: string | null; city: string | null } | null;
    status: { long: string; short: string; elapsed: number | null };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string | null;
    season: number;
    round: string;
  };
  teams: {
    home: { id: number; name: string; logo: string; winner: boolean | null };
    away: { id: number; name: string; logo: string; winner: boolean | null };
  };
  goals: { home: number | null; away: number | null };
  score: {
    halftime: { home: number | null; away: number | null };
    fulltime: { home: number | null; away: number | null };
    extratime: { home: number | null; away: number | null };
    penalty: { home: number | null; away: number | null };
  };
}

export async function fetchFixtures(params: {
  league?: number;
  season?: number;
  from?: string;
  to?: string;
  status?: string;
  live?: string;
  next?: number;
  last?: number;
}): Promise<ApiFixture[]> {
  const p: Record<string, string | number> = {};
  if (params.league != null) p.league = params.league;
  if (params.season != null) p.season = params.season;
  if (params.from) p.from = params.from;
  if (params.to) p.to = params.to;
  if (params.status) p.status = params.status;
  if (params.live) p.live = params.live;
  if (params.next != null) p.next = params.next;
  if (params.last != null) p.last = params.last;
  const data = await apiFetch<ApiResponse<ApiFixture>>("/fixtures", p);
  return data.response;
}

// --- Lineups ---

export interface ApiLineupPlayer {
  player: { id: number; name: string; number: number; pos: string };
  grid: string | null;
}

export interface ApiLineup {
  team: { id: number; name: string; logo: string };
  coach: { id: number; name: string; photo: string };
  formation: string;
  startXI: ApiLineupPlayer[];
  substitutes: ApiLineupPlayer[];
}

export async function fetchLineups(fixtureId: number): Promise<ApiLineup[]> {
  const data = await apiFetch<ApiResponse<ApiLineup>>("/fixtures/lineups", { fixture: fixtureId });
  return data.response;
}

// --- Injuries ---

export interface ApiInjury {
  player: { id: number; name: string; photo: string; type: string; reason: string };
  team: { id: number; name: string; logo: string };
  fixture: { id: number; timezone: string; date: string; timestamp: number };
  league: { id: number; season: number; name: string; country: string; logo: string; flag: string | null };
}

export async function fetchInjuries(params: {
  league?: number;
  season?: number;
  fixture?: number;
  team?: number;
}): Promise<ApiInjury[]> {
  const p: Record<string, string | number> = {};
  if (params.league != null) p.league = params.league;
  if (params.season != null) p.season = params.season;
  if (params.fixture != null) p.fixture = params.fixture;
  if (params.team != null) p.team = params.team;
  const data = await apiFetch<ApiResponse<ApiInjury>>("/injuries", p);
  return data.response;
}

// --- Live Match Events ---

export interface ApiMatchEvent {
  time: { elapsed: number; extra: number | null };
  team: { id: number; name: string; logo: string };
  player: { id: number; name: string };
  assist: { id: number | null; name: string | null };
  type: "Goal" | "Card" | "subst" | "Var";
  detail: string;
  comments: string | null;
}

export async function fetchFixtureEvents(fixtureId: number): Promise<ApiMatchEvent[]> {
  const data = await apiFetch<ApiResponse<ApiMatchEvent>>("/fixtures/events", { fixture: fixtureId });
  return data.response;
}

// --- Player Statistics (per fixture) ---

export interface ApiPlayerFixtureStats {
  player: { id: number; name: string; photo: string };
  statistics: Array<{
    team: { id: number; name: string };
    games: { minutes: number | null; number: number | null; position: string; rating: string | null; captain: boolean };
    shots: { total: number | null; on: number | null };
    goals: { total: number | null; conceded: number | null; assists: number | null; saves: number | null };
    passes: { total: number | null; key: number | null; accuracy: string | null };
    tackles: { total: number | null; blocks: number | null; interceptions: number | null };
    duels: { total: number | null; won: number | null };
    dribbles: { attempts: number | null; success: number | null; past: number | null };
    fouls: { drawn: number | null; committed: number | null };
    cards: { yellow: number; red: number };
    penalty: { won: number | null; commited: number | null; scored: number | null; missed: number | null; saved: number | null };
  }>;
}

export async function fetchFixturePlayerStats(fixtureId: number): Promise<Array<{ team: { id: number; name: string }; players: ApiPlayerFixtureStats[] }>> {
  const data = await apiFetch<ApiResponse<{ team: { id: number; name: string }; players: ApiPlayerFixtureStats[] }>>("/fixtures/players", { fixture: fixtureId });
  return data.response;
}

// --- Head-to-Head ---

export async function fetchH2H(team1Id: number, team2Id: number, last?: number): Promise<ApiFixture[]> {
  const p: Record<string, string | number> = { h2h: `${team1Id}-${team2Id}` };
  if (last != null) p.last = last;
  const data = await apiFetch<ApiResponse<ApiFixture>>("/fixtures/headtohead", p);
  return data.response;
}

// --- Standings ---

export interface ApiStandingEntry {
  rank: number;
  team: { id: number; name: string; logo: string };
  points: number;
  goalsDiff: number;
  group: string;
  form: string;
  status: string;
  description: string | null;
  all: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } };
  home: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } };
  away: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } };
}

export async function fetchStandings(league: number, season: number): Promise<ApiStandingEntry[][]> {
  const data = await apiFetch<ApiResponse<{ league: { standings: ApiStandingEntry[][] } }>>("/standings", { league, season });
  if (data.response.length === 0) return [];
  return data.response[0].league.standings;
}

// --- Transfers ---

export interface ApiTransfer {
  player: { id: number; name: string };
  update: string;
  transfers: Array<{
    date: string;
    type: string;
    teams: {
      in: { id: number; name: string; logo: string };
      out: { id: number; name: string; logo: string };
    };
  }>;
}

export async function fetchTransfers(params: {
  player?: number;
  team?: number;
}): Promise<ApiTransfer[]> {
  const p: Record<string, string | number> = {};
  if (params.player != null) p.player = params.player;
  if (params.team != null) p.team = params.team;
  const data = await apiFetch<ApiResponse<ApiTransfer>>("/transfers", p);
  return data.response;
}

// --- Top Scorers ---

export interface ApiTopScorer {
  player: {
    id: number;
    name: string;
    firstname: string;
    lastname: string;
    nationality: string;
    photo: string;
  };
  statistics: Array<{
    team: { id: number; name: string; logo: string };
    league: { id: number; name: string; country: string; season: number };
    games: { appearences: number; minutes: number };
    goals: { total: number; assists: number };
    penalty: { scored: number; missed: number };
    cards: { yellow: number; red: number };
  }>;
}

export async function fetchTopScorers(league: number, season: number): Promise<ApiTopScorer[]> {
  const data = await apiFetch<ApiResponse<ApiTopScorer>>("/players/topscorers", { league, season });
  return data.response;
}

// --- Sidelined (injuries/suspensions for a player) ---

export interface ApiSidelined {
  type: string;
  start: string;
  end: string | null;
}

export async function fetchPlayerSidelined(playerId: number): Promise<ApiSidelined[]> {
  const data = await apiFetch<ApiResponse<ApiSidelined>>("/sidelined", { player: playerId });
  return data.response;
}

// --- Current Season ---

export async function fetchCurrentSeason(league: number): Promise<number | null> {
  const data = await apiFetch<ApiResponse<{ league: { id: number; name: string }; seasons: Array<{ year: number; current: boolean }> }>>("/leagues", { id: league });
  if (data.response.length === 0) return null;
  const current = data.response[0].seasons.find((s) => s.current);
  return current?.year ?? null;
}
