/**
 * Registry of all competitions covered by the Football Intelligence Engine.
 * Tier 1: full coverage (all market types, all signals)
 * Tier 2: good coverage (match markets + narrative if interesting)
 * Tier 3: big matches only / when there's hype
 * Tier 4: tournament-time only (Euros, World Cup, etc.)
 */

import type { Competition } from "./types";

export const COMPETITIONS: Competition[] = [
  // ─── Tier 1: Full Coverage ────────────────────────────────────
  {
    id: "serie-a",
    name: "Serie A",
    country: "Italy",
    tier: 1,
    footballDataCode: "SA",
    apiFootballId: 135,
    oddsApiKey: "soccer_italy_serie_a",
  },
  {
    id: "champions-league",
    name: "Champions League",
    country: "Europe",
    tier: 1,
    footballDataCode: "CL",
    apiFootballId: 2,
    oddsApiKey: "soccer_uefa_champs_league",
  },
  {
    id: "europa-league",
    name: "Europa League",
    country: "Europe",
    tier: 1,
    footballDataCode: "EL",
    apiFootballId: 3,
    oddsApiKey: "soccer_uefa_europa_league",
  },
  {
    id: "conference-league",
    name: "Conference League",
    country: "Europe",
    tier: 1,
    apiFootballId: 848,
    oddsApiKey: "soccer_uefa_europa_conference_league",
  },
  {
    id: "premier-league",
    name: "Premier League",
    country: "England",
    tier: 1,
    footballDataCode: "PL",
    apiFootballId: 39,
    oddsApiKey: "soccer_epl",
  },
  {
    id: "la-liga",
    name: "La Liga",
    country: "Spain",
    tier: 1,
    footballDataCode: "PD",
    apiFootballId: 140,
    oddsApiKey: "soccer_spain_la_liga",
  },
  {
    id: "bundesliga",
    name: "Bundesliga",
    country: "Germany",
    tier: 1,
    footballDataCode: "BL1",
    apiFootballId: 78,
    oddsApiKey: "soccer_germany_bundesliga",
  },
  {
    id: "ligue-1",
    name: "Ligue 1",
    country: "France",
    tier: 1,
    footballDataCode: "FL1",
    apiFootballId: 61,
    oddsApiKey: "soccer_france_ligue_one",
  },

  // ─── Tier 2: Good Coverage ────────────────────────────────────
  {
    id: "serie-b",
    name: "Serie B",
    country: "Italy",
    tier: 2,
    footballDataCode: "SB",
    apiFootballId: 136,
    oddsApiKey: "soccer_italy_serie_b",
  },
  {
    id: "coppa-italia",
    name: "Coppa Italia",
    country: "Italy",
    tier: 2,
    apiFootballId: 137,
  },
  {
    id: "supercoppa-italiana",
    name: "Supercoppa Italiana",
    country: "Italy",
    tier: 2,
    apiFootballId: 547,
  },
  {
    id: "eredivisie",
    name: "Eredivisie",
    country: "Netherlands",
    tier: 2,
    footballDataCode: "DED",
    apiFootballId: 88,
    oddsApiKey: "soccer_netherlands_eredivisie",
  },
  {
    id: "primeira-liga",
    name: "Primeira Liga",
    country: "Portugal",
    tier: 2,
    footballDataCode: "PPL",
    apiFootballId: 94,
    oddsApiKey: "soccer_portugal_primeira_liga",
  },
  {
    id: "championship",
    name: "Championship",
    country: "England",
    tier: 2,
    footballDataCode: "ELC",
    apiFootballId: 40,
    oddsApiKey: "soccer_efl_champ",
  },
  {
    id: "fa-cup",
    name: "FA Cup",
    country: "England",
    tier: 2,
    apiFootballId: 45,
    oddsApiKey: "soccer_fa_cup",
  },
  {
    id: "copa-del-rey",
    name: "Copa del Rey",
    country: "Spain",
    tier: 2,
    apiFootballId: 143,
  },
  {
    id: "dfb-pokal",
    name: "DFB Pokal",
    country: "Germany",
    tier: 2,
    footballDataCode: "DFB",
    apiFootballId: 529,
  },

  // ─── Tier 3: Big Matches / When There's Hype ─────────────────
  {
    id: "scottish-premiership",
    name: "Scottish Premiership",
    country: "Scotland",
    tier: 3,
    apiFootballId: 179,
  },
  {
    id: "belgian-pro-league",
    name: "Belgian Pro League",
    country: "Belgium",
    tier: 3,
    apiFootballId: 144,
  },
  {
    id: "super-lig",
    name: "Süper Lig",
    country: "Turkey",
    tier: 3,
    apiFootballId: 203,
    oddsApiKey: "soccer_turkey_super_league",
  },
  {
    id: "efl-cup",
    name: "EFL Cup",
    country: "England",
    tier: 3,
    apiFootballId: 48,
  },
  {
    id: "nations-league",
    name: "Nations League",
    country: "Europe",
    tier: 3,
    apiFootballId: 5,
  },
  {
    id: "wc-qualifiers-europe",
    name: "World Cup Qualifiers (Europe)",
    country: "Europe",
    tier: 3,
    apiFootballId: 34,
  },
  {
    id: "club-world-cup",
    name: "FIFA Club World Cup",
    country: "World",
    tier: 3,
    apiFootballId: 15,
  },

  // ─── Tier 4: Tournament-Time Only ────────────────────────────
  {
    id: "world-cup",
    name: "FIFA World Cup",
    country: "World",
    tier: 4,
    apiFootballId: 1,
    oddsApiKey: "soccer_fifa_world_cup",
  },
  {
    id: "euro-championship",
    name: "European Championship",
    country: "Europe",
    tier: 4,
    apiFootballId: 4,
    oddsApiKey: "soccer_uefa_european_championship",
  },
  {
    id: "copa-america",
    name: "Copa América",
    country: "South America",
    tier: 4,
    apiFootballId: 9,
  },
];

export function getCompetitionById(id: string): Competition | undefined {
  return COMPETITIONS.find((c) => c.id === id);
}

export function getCompetitionByApiFootballId(apiId: number): Competition | undefined {
  return COMPETITIONS.find((c) => c.apiFootballId === apiId);
}

export function getCompetitionByFootballDataCode(code: string): Competition | undefined {
  return COMPETITIONS.find((c) => c.footballDataCode === code);
}

export function getCompetitionsByTier(tier: number): Competition[] {
  return COMPETITIONS.filter((c) => c.tier <= tier);
}

export function getAllApiFootballIds(): number[] {
  return COMPETITIONS.filter((c) => c.apiFootballId != null).map((c) => c.apiFootballId!);
}

export function getAllOddsApiKeys(): string[] {
  return COMPETITIONS.filter((c) => c.oddsApiKey != null).map((c) => c.oddsApiKey!);
}
