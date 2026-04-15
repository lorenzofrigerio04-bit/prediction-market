/**
 * Normalizers: transform raw API responses into unified FootballSignal objects.
 * Each API client has a corresponding normalizer.
 */

import { randomUUID } from "crypto";
import type {
  FootballSignal,
  HeadToHead,
  Match,
  MatchOdds,
  MatchStatus,
  PlayerInfo,
  TeamStanding,
} from "../types";
import { getCompetitionByApiFootballId } from "../competitions";
import { getApiSource } from "./source-tiers";
import type {
  ApiFixture,
  ApiInjury,
  ApiLineup,
  ApiMatchEvent,
  ApiStandingEntry,
  ApiTopScorer,
} from "./clients/api-football";

// ---------------------------------------------------------------------------
// API-Football status → unified MatchStatus
// ---------------------------------------------------------------------------

const STATUS_MAP: Record<string, MatchStatus> = {
  TBD: "SCHEDULED",
  NS: "NOT_STARTED",
  "1H": "IN_PLAY",
  HT: "HALFTIME",
  "2H": "IN_PLAY",
  ET: "EXTRA_TIME",
  BT: "HALFTIME",
  P: "PENALTY",
  SUSP: "SUSPENDED",
  INT: "PAUSED",
  FT: "FINISHED",
  AET: "FINISHED_AET",
  PEN: "FINISHED_PEN",
  PST: "POSTPONED",
  CANC: "CANCELLED",
  ABD: "CANCELLED",
  AWD: "FINISHED",
  WO: "FINISHED",
  LIVE: "IN_PLAY",
};

// ---------------------------------------------------------------------------
// Fixtures → Match
// ---------------------------------------------------------------------------

export function normalizeFixture(f: ApiFixture): Match {
  const competition = getCompetitionByApiFootballId(f.league.id);

  return {
    id: `apifb-${f.fixture.id}`,
    apiFootballId: f.fixture.id,
    competition: competition ?? {
      id: `league-${f.league.id}`,
      name: f.league.name,
      country: f.league.country,
      tier: 3,
      apiFootballId: f.league.id,
    },
    homeTeam: {
      id: `team-${f.teams.home.id}`,
      name: f.teams.home.name,
      logo: f.teams.home.logo,
    },
    awayTeam: {
      id: `team-${f.teams.away.id}`,
      name: f.teams.away.name,
      logo: f.teams.away.logo,
    },
    status: STATUS_MAP[f.fixture.status.short] ?? "SCHEDULED",
    utcDate: f.fixture.date,
    venue: f.fixture.venue?.name ?? undefined,
    referee: f.fixture.referee ?? undefined,
    score: {
      fullTime: { home: f.score.fulltime.home, away: f.score.fulltime.away },
      halfTime: { home: f.score.halftime.home, away: f.score.halftime.away },
      extraTime: { home: f.score.extratime.home, away: f.score.extratime.away },
      penalty: { home: f.score.penalty.home, away: f.score.penalty.away },
    },
  };
}

// ---------------------------------------------------------------------------
// Fixtures → Signals
// ---------------------------------------------------------------------------

export function fixtureToSignal(f: ApiFixture): FootballSignal {
  const match = normalizeFixture(f);
  return {
    id: randomUUID(),
    type: "fixture",
    source: getApiSource("api-football"),
    timestamp: f.fixture.date,
    headline: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
    content: `${match.competition.name} — ${new Date(f.fixture.date).toLocaleDateString("it-IT")}`,
    confidence: 1.0,
    competitionId: match.competition.id,
    matchId: match.id,
    apiFootballMatchId: f.fixture.id,
    teamIds: [match.homeTeam.id, match.awayTeam.id],
    payload: {
      venue: match.venue,
      referee: match.referee,
      round: f.league.round,
      status: match.status,
    },
    tags: ["fixture", match.competition.id],
  };
}

// ---------------------------------------------------------------------------
// Injuries → Signals + PlayerInfo
// ---------------------------------------------------------------------------

export function injuryToSignal(inj: ApiInjury): FootballSignal {
  return {
    id: randomUUID(),
    type: "injury",
    source: getApiSource("api-football"),
    timestamp: inj.fixture.date,
    headline: `${inj.player.name} (${inj.team.name}) — ${inj.player.reason || inj.player.type}`,
    confidence: 0.95,
    competitionId: getCompetitionByApiFootballId(inj.league.id)?.id,
    apiFootballMatchId: inj.fixture.id,
    teamIds: [`team-${inj.team.id}`],
    playerIds: [`player-${inj.player.id}`],
    payload: {
      injuryType: inj.player.type,
      reason: inj.player.reason,
      playerId: inj.player.id,
      teamId: inj.team.id,
    },
    tags: ["injury", `team-${inj.team.id}`],
  };
}

export function injuryToPlayerInfo(inj: ApiInjury): PlayerInfo {
  return {
    id: `player-${inj.player.id}`,
    apiFootballId: inj.player.id,
    name: inj.player.name,
    team: { id: `team-${inj.team.id}`, name: inj.team.name },
    injured: true,
    injuryType: inj.player.reason || inj.player.type,
    photo: inj.player.photo,
  };
}

// ---------------------------------------------------------------------------
// Lineups → PlayerInfo[]
// ---------------------------------------------------------------------------

export function lineupToPlayers(lineup: ApiLineup): PlayerInfo[] {
  const players: PlayerInfo[] = [];
  for (const entry of [...lineup.startXI, ...lineup.substitutes]) {
    players.push({
      id: `player-${entry.player.id}`,
      apiFootballId: entry.player.id,
      name: entry.player.name,
      position: entry.player.pos,
      team: { id: `team-${lineup.team.id}`, name: lineup.team.name },
    });
  }
  return players;
}

// ---------------------------------------------------------------------------
// Live Match Events → Signals
// ---------------------------------------------------------------------------

export function matchEventToSignal(
  event: ApiMatchEvent,
  fixtureId: number,
  competitionId?: string
): FootballSignal {
  const typeMap: Record<string, string> = {
    Goal: "live_event",
    Card: "discipline",
    subst: "live_event",
    Var: "var_incident",
  };

  return {
    id: randomUUID(),
    type: (typeMap[event.type] ?? "live_event") as FootballSignal["type"],
    source: getApiSource("api-football"),
    timestamp: new Date().toISOString(),
    headline: `${event.time.elapsed}' — ${event.type}: ${event.player.name} (${event.team.name}) ${event.detail}`,
    content: event.comments ?? undefined,
    confidence: 1.0,
    competitionId,
    apiFootballMatchId: fixtureId,
    teamIds: [`team-${event.team.id}`],
    playerIds: [`player-${event.player.id}`],
    payload: {
      minute: event.time.elapsed,
      extraMinute: event.time.extra,
      eventType: event.type,
      detail: event.detail,
      assistId: event.assist?.id,
      assistName: event.assist?.name,
    },
    tags: ["live", event.type.toLowerCase()],
  };
}

// ---------------------------------------------------------------------------
// Standings → TeamStanding[]
// ---------------------------------------------------------------------------

export function normalizeStandings(entries: ApiStandingEntry[]): TeamStanding[] {
  return entries.map((e) => ({
    teamId: `team-${e.team.id}`,
    teamName: e.team.name,
    position: e.rank,
    points: e.points,
    played: e.all.played,
    won: e.all.win,
    drawn: e.all.draw,
    lost: e.all.lose,
    goalsFor: e.all.goals.for,
    goalsAgainst: e.all.goals.against,
    goalDifference: e.goalsDiff,
    form: e.form || undefined,
  }));
}

// ---------------------------------------------------------------------------
// H2H → HeadToHead
// ---------------------------------------------------------------------------

export function normalizeH2H(fixtures: ApiFixture[]): HeadToHead {
  let homeWins = 0;
  let awayWins = 0;
  let draws = 0;

  const recentMatches = fixtures
    .filter((f) => f.fixture.status.short === "FT" || f.fixture.status.short === "AET" || f.fixture.status.short === "PEN")
    .map((f) => {
      const hg = f.goals.home ?? 0;
      const ag = f.goals.away ?? 0;
      if (hg > ag) homeWins++;
      else if (ag > hg) awayWins++;
      else draws++;

      return {
        date: f.fixture.date,
        homeTeam: f.teams.home.name,
        awayTeam: f.teams.away.name,
        homeGoals: hg,
        awayGoals: ag,
        competition: f.league.name,
      };
    });

  return {
    totalMatches: recentMatches.length,
    homeWins,
    awayWins,
    draws,
    recentMatches: recentMatches.slice(0, 10),
  };
}

// ---------------------------------------------------------------------------
// Top Scorers → signals
// ---------------------------------------------------------------------------

export function topScorerToSignal(scorer: ApiTopScorer, leagueId: number): FootballSignal {
  const stats = scorer.statistics[0];
  return {
    id: randomUUID(),
    type: "player_stats",
    source: getApiSource("api-football"),
    timestamp: new Date().toISOString(),
    headline: `${scorer.player.name}: ${stats?.goals.total ?? 0} gol in ${stats?.games.appearences ?? 0} presenze (${stats?.league.name ?? ""})`,
    confidence: 1.0,
    competitionId: getCompetitionByApiFootballId(leagueId)?.id,
    playerIds: [`player-${scorer.player.id}`],
    teamIds: stats ? [`team-${stats.team.id}`] : [],
    payload: {
      goals: stats?.goals.total ?? 0,
      assists: stats?.goals.assists ?? 0,
      appearances: stats?.games.appearences ?? 0,
      penaltyScored: stats?.penalty.scored ?? 0,
      yellowCards: stats?.cards.yellow ?? 0,
      redCards: stats?.cards.red ?? 0,
    },
    tags: ["top-scorer", `league-${leagueId}`],
  };
}
