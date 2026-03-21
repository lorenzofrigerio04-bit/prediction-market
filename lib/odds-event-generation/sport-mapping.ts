/**
 * Mappatura sport_key The Odds API → categoria piattaforma.
 * Usata per generare eventi da quote bookmaker.
 */

/** sport_key → categoria piattaforma (Calcio, Tennis, Pallacanestro) */
export const SPORT_KEY_TO_CATEGORY: Record<string, string> = {
  soccer_italy_serie_a: "Calcio",
  soccer_italy_coppa_italia: "Calcio",
  soccer_uefa_champs_league: "Calcio",
  soccer_uefa_europa_league: "Calcio",
  soccer_uefa_europa_conference_league: "Calcio",
  soccer_spain_la_liga: "Calcio",
  soccer_germany_bundesliga: "Calcio",
  soccer_france_ligue_one: "Calcio",
  soccer_epl: "Calcio",
  tennis_atp_indian_wells: "Tennis",
  tennis_atp_miami_open: "Tennis",
  tennis_atp_monte_carlo_masters: "Tennis",
  tennis_atp_madrid_open: "Tennis",
  tennis_atp_italian_open: "Tennis",
  tennis_atp_french_open: "Tennis",
  tennis_atp_wimbledon: "Tennis",
  tennis_atp_us_open: "Tennis",
  basketball_euroleague: "Pallacanestro",
  basketball_nba: "Pallacanestro",
  basketball_ncaab: "Pallacanestro",
};

/** Sport keys da usare nella pipeline (limitati per risparmiare crediti Odds API) */
export const ODDS_PIPELINE_SPORT_KEYS = [
  "soccer_italy_serie_a",
  "soccer_uefa_champs_league",
  "soccer_uefa_europa_league",
  "tennis_atp_italian_open",
  "tennis_atp_french_open",
  "tennis_atp_wimbledon",
  "basketball_euroleague",
  "basketball_nba",
] as const;
