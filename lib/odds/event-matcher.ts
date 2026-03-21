/**
 * Matching eventi piattaforma → The Odds API.
 * Estrae team dal title e cerca corrispondenze negli eventi h2h.
 */

import { fetchOddsForSports } from "./odds-api-client";
import type { OddsApiEvent, OddsApiBookmaker, OddsApiOutcome } from "./odds-api-client";
import { teamsMatch, teamMatchesOurs } from "./team-mapping";

/** Categoria piattaforma → sport_key The Odds API (per match singoli) */
const CATEGORY_TO_SPORT_KEYS: Record<string, string[]> = {
  Calcio: [
    "soccer_italy_serie_a",
    "soccer_italy_coppa_italia",
    "soccer_uefa_champs_league",
    "soccer_uefa_europa_league",
    "soccer_uefa_europa_conference_league",
    "soccer_spain_la_liga",
    "soccer_germany_bundesliga",
    "soccer_france_ligue_one",
    "soccer_epl",
  ],
  Tennis: [
    "tennis_atp_indian_wells",
    "tennis_atp_miami_open",
    "tennis_atp_monte_carlo_masters",
    "tennis_atp_madrid_open",
    "tennis_atp_italian_open",
    "tennis_atp_french_open",
    "tennis_atp_wimbledon",
    "tennis_atp_us_open",
  ],
  Pallacanestro: ["basketball_euroleague", "basketball_nba", "basketball_ncaab"],
  Pallavolo: [],
  "Formula 1": [],
  MotoGP: [],
  Sport: [
    "soccer_italy_serie_a",
    "soccer_italy_coppa_italia",
    "soccer_uefa_champs_league",
    "soccer_uefa_europa_league",
    "soccer_uefa_europa_conference_league",
  ],
};

/** Pattern per estrarre "X vincerà contro Y" dal title */
const MATCH_PATTERNS = [
  // "Il Napoli vincerà contro il Torino?" "La Juve vincerà contro il Milan?"
  /(?:il|la|lo|l'|un|una)?\s*([A-Za-zÀ-ÿ\s'-]+)\s+vincer[àa]\s+contro\s+(?:il|la|lo|l'|un|una)?\s*([A-Za-zÀ-ÿ\s'-]+)\s*\??/i,
  // "Napoli batte Torino?" "Juve batte Milan?"
  /(?:il|la|lo|l'|un|una)?\s*([A-Za-zÀ-ÿ\s'-]+)\s+batte\s+(?:il|la|lo|l'|un|una)?\s*([A-Za-zÀ-ÿ\s'-]+)\s*\??/i,
  // "Napoli - Torino" "Juve vs Milan"
  /(?:il|la|lo|l'|un|una)?\s*([A-Za-zÀ-ÿ\s'-]+)\s*[-–—vs.]\s*(?:il|la|lo|l'|un|una)?\s*([A-Za-zÀ-ÿ\s'-]+)\s*\??/i,
  // "X vincerà su Y?" (meno comune)
  /(?:il|la|lo|l'|un|una)?\s*([A-Za-zÀ-ÿ\s'-]+)\s+vincer[àa]\s+su\s+(?:il|la|lo|l'|un|una)?\s*([A-Za-zÀ-ÿ\s'-]+)\s*\??/i,
];

function extractTeamsFromTitle(title: string): { teamA: string; teamB: string } | null {
  const trimmed = title.trim();
  for (const pattern of MATCH_PATTERNS) {
    const m = trimmed.match(pattern);
    if (m) {
      const teamA = m[1]!.trim().replace(/\s+/g, " ");
      const teamB = m[2]!.trim().replace(/\s+/g, " ");
      if (teamA.length >= 2 && teamB.length >= 2 && teamA !== teamB) {
        return { teamA, teamB };
      }
    }
  }
  return null;
}

function getSportKeysForCategory(category: string): string[] {
  const keys = CATEGORY_TO_SPORT_KEYS[category];
  if (keys?.length) return keys;
  return CATEGORY_TO_SPORT_KEYS["Sport"] ?? [];
}

export type BookmakerOdds = {
  key: string;
  title: string;
  yesPrice: number;
  noPrice: number; // migliore tra Draw e avversario
};

export type MatchedOdds = {
  matched: true;
  eventId: string;
  homeTeam: string;
  awayTeam: string;
  yesTeam: string; // squadra per SÌ (vittoria)
  noTeam: string; // squadra per NO (avversario)
  commenceTime: string;
  sportTitle: string;
  bookmakers: BookmakerOdds[];
  bestYes: number;
  bestNo: number;
};

export type MatchResult =
  | { matched: false }
  | MatchedOdds;

function extractH2hPrices(
  bookmaker: OddsApiBookmaker,
  yesTeam: string,
  noTeams: string[]
): { yesPrice: number; noPrice: number } | null {
  const h2h = bookmaker.markets.find((m) => m.key === "h2h");
  if (!h2h?.outcomes?.length) return null;

  const yesOutcome = h2h.outcomes.find(
    (o) => o.name.toLowerCase() === yesTeam.toLowerCase()
  );
  const noOutcomes = h2h.outcomes.filter((o) =>
    noTeams.some((n) => n.toLowerCase() === o.name.toLowerCase())
  );

  if (!yesOutcome || noOutcomes.length === 0) return null;

  const noPrice = Math.max(...noOutcomes.map((o) => o.price));
  return { yesPrice: yesOutcome.price, noPrice };
}

/**
 * Cerca quote bookmaker per un evento della piattaforma.
 */
export async function matchEventToOdds(
  title: string,
  category: string
): Promise<MatchResult> {
  const teams = extractTeamsFromTitle(title);
  if (!teams) return { matched: false };

  const sportKeys = getSportKeysForCategory(category);
  if (sportKeys.length === 0) return { matched: false };

  const oddsBySport = await fetchOddsForSports(sportKeys);

  for (const [, events] of oddsBySport) {
    for (const ev of events) {
      if (
        teamsMatch(teams.teamA, teams.teamB, ev.home_team, ev.away_team)
      ) {
        // SÌ = vittoria team "favorevole" (teamA nel nostro titolo)
        // NO = Draw + teamB (avversario)
        const yesTeam = teamMatchesOurs(teams.teamA, ev.home_team)
          ? ev.home_team
          : teamMatchesOurs(teams.teamA, ev.away_team)
            ? ev.away_team
            : ev.home_team; // fallback

        const noTeamApi = yesTeam === ev.home_team ? ev.away_team : ev.home_team;
        const noTeams = ["Draw", noTeamApi];

        const bookmakers: BookmakerOdds[] = [];
        for (const bm of ev.bookmakers) {
          const prices = extractH2hPrices(bm, yesTeam, noTeams);
          if (prices) {
            bookmakers.push({
              key: bm.key,
              title: bm.title,
              yesPrice: prices.yesPrice,
              noPrice: prices.noPrice,
            });
          }
        }

        if (bookmakers.length === 0) continue;

        const bestYes = Math.max(...bookmakers.map((b) => b.yesPrice));
        const bestNo = Math.max(...bookmakers.map((b) => b.noPrice));

        return {
          matched: true,
          eventId: ev.id,
          homeTeam: ev.home_team,
          awayTeam: ev.away_team,
          yesTeam,
          noTeam: noTeamApi,
          commenceTime: ev.commence_time,
          sportTitle: ev.sport_title,
          bookmakers,
          bestYes,
          bestNo,
        };
      }
    }
  }

  return { matched: false };
}
