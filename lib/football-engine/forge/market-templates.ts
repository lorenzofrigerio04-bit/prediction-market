/**
 * Market templates for the FORGE layer.
 * Define standard outcome sets, resolution criteria, and edge case policies
 * for recurring event types. The AI can override or extend these.
 */

import type { MarketTypeId } from "@/lib/market-types";

// ---------------------------------------------------------------------------
// Template definition
// ---------------------------------------------------------------------------

export interface MarketTemplate {
  id: string;
  name: string;
  category: string;
  marketType: MarketTypeId;
  outcomes?: Array<{ key: string; label: string }>;
  /** Default resolution criteria for binary/threshold */
  resolutionCriteriaYes?: string;
  resolutionCriteriaNo?: string;
  /** Default resolution criteria for multi-option (full text) */
  resolutionCriteriaFull?: string;
  /** Default resolution authority */
  resolutionAuthorityHost: string;
  resolutionAuthorityType: string;
  /** How to compute closesAt relative to match start */
  closesAtStrategy: "match_start" | "match_end" | "halftime" | "custom_hours";
  /** Hours offset from strategy anchor. Negative = before, positive = after */
  closesAtOffsetHours?: number;
  /** Buffer hours after event for resolution */
  resolutionBufferHours: number;
  /** Edge case policies */
  edgeCases: {
    matchPostponed: string;
    playerNotPlaying?: string;
    dataUnavailable: string;
  };
  /** sport_market_kind for auto-resolution compatibility */
  sportMarketKind: string;
}

// ---------------------------------------------------------------------------
// Templates registry
// ---------------------------------------------------------------------------

export const MARKET_TEMPLATES: MarketTemplate[] = [
  // ─── Tier 1: Core Match Markets ───────────────────────────────

  {
    id: "football-1x2",
    name: "Risultato Finale 1X2",
    category: "match_core",
    marketType: "MULTIPLE_CHOICE",
    outcomes: [
      { key: "result_home", label: "Vittoria Casa" },
      { key: "result_draw", label: "Pareggio" },
      { key: "result_away", label: "Vittoria Ospite" },
    ],
    resolutionCriteriaFull: "Risultato finale dei 90 minuti regolamentari (esclusi supplementari e rigori). HOME_TEAM vince => result_home, pareggio => result_draw, AWAY_TEAM vince => result_away.",
    resolutionAuthorityHost: "api.football-data.org",
    resolutionAuthorityType: "REPUTABLE",
    closesAtStrategy: "match_start",
    closesAtOffsetHours: 0,
    resolutionBufferHours: 3,
    edgeCases: {
      matchPostponed: "Mercato annullato e rimborsato se la partita non si gioca entro 48h dalla data originale.",
      dataUnavailable: "Se il risultato non è disponibile dalle fonti automatiche, risoluzione manuale entro 24h.",
    },
    sportMarketKind: "FULL_TIME_RESULT_1X2",
  },

  {
    id: "football-btts",
    name: "Entrambe Segnano (BTTS)",
    category: "match_core",
    marketType: "BINARY",
    resolutionCriteriaYes: "Entrambe le squadre segnano almeno 1 gol nel risultato finale dei 90 minuti.",
    resolutionCriteriaNo: "Almeno una squadra termina con 0 gol segnati.",
    resolutionAuthorityHost: "api.football-data.org",
    resolutionAuthorityType: "REPUTABLE",
    closesAtStrategy: "match_start",
    closesAtOffsetHours: 0,
    resolutionBufferHours: 3,
    edgeCases: {
      matchPostponed: "Mercato annullato e rimborsato se la partita non si gioca entro 48h.",
      dataUnavailable: "Risoluzione manuale entro 24h basata su fonti ufficiali.",
    },
    sportMarketKind: "BOTH_TEAMS_TO_SCORE",
  },

  {
    id: "football-over-under",
    name: "Gol Totali (Range)",
    category: "match_core",
    marketType: "RANGE",
    outcomes: [
      { key: "goals_0_1", label: "0-1 gol" },
      { key: "goals_2", label: "2 gol" },
      { key: "goals_3", label: "3 gol" },
      { key: "goals_4_plus", label: "4+ gol" },
    ],
    resolutionCriteriaFull: "Somma gol finale dei 90 minuti. 0-1 => goals_0_1; 2 => goals_2; 3 => goals_3; 4+ => goals_4_plus.",
    resolutionAuthorityHost: "api.football-data.org",
    resolutionAuthorityType: "REPUTABLE",
    closesAtStrategy: "match_start",
    closesAtOffsetHours: 0,
    resolutionBufferHours: 3,
    edgeCases: {
      matchPostponed: "Mercato annullato se la partita non si gioca entro 48h.",
      dataUnavailable: "Risoluzione manuale entro 24h.",
    },
    sportMarketKind: "TOTAL_GOALS_BUCKETS",
  },

  {
    id: "football-over-2-5",
    name: "Over 2.5 Gol",
    category: "match_core",
    marketType: "BINARY",
    resolutionCriteriaYes: "La somma dei gol di entrambe le squadre nei 90 minuti è >= 3.",
    resolutionCriteriaNo: "La somma dei gol di entrambe le squadre nei 90 minuti è <= 2.",
    resolutionAuthorityHost: "api.football-data.org",
    resolutionAuthorityType: "REPUTABLE",
    closesAtStrategy: "match_start",
    closesAtOffsetHours: 0,
    resolutionBufferHours: 3,
    edgeCases: {
      matchPostponed: "Mercato annullato se la partita non si gioca entro 48h.",
      dataUnavailable: "Risoluzione manuale entro 24h.",
    },
    sportMarketKind: "OVER_2_5_GOALS",
  },

  // ─── Tier 2: Player Performance ───────────────────────────────

  {
    id: "football-player-shots-threshold",
    name: "Tiri in Porta Giocatore",
    category: "player_performance",
    marketType: "THRESHOLD",
    resolutionCriteriaYes: "Il giocatore specificato registra un numero di tiri in porta superiore alla soglia indicata nel titolo, secondo le statistiche ufficiali della partita.",
    resolutionCriteriaNo: "Il giocatore registra un numero di tiri in porta uguale o inferiore alla soglia.",
    resolutionAuthorityHost: "v3.football.api-sports.io",
    resolutionAuthorityType: "REPUTABLE",
    closesAtStrategy: "match_start",
    closesAtOffsetHours: 0,
    resolutionBufferHours: 4,
    edgeCases: {
      matchPostponed: "Mercato annullato se la partita non si gioca entro 48h.",
      playerNotPlaying: "Se il giocatore non scende in campo (nemmeno dalla panchina), il mercato si risolve NO.",
      dataUnavailable: "Se le statistiche individuali non sono disponibili, risoluzione manuale entro 48h.",
    },
    sportMarketKind: "PLAYER_SHOTS_ON_TARGET",
  },

  {
    id: "football-player-goal-scorer",
    name: "Giocatore Segna",
    category: "player_performance",
    marketType: "BINARY",
    resolutionCriteriaYes: "Il giocatore specificato segna almeno 1 gol (esclusi autogol) nei 90 minuti regolamentari.",
    resolutionCriteriaNo: "Il giocatore non segna nei 90 minuti (o non gioca).",
    resolutionAuthorityHost: "v3.football.api-sports.io",
    resolutionAuthorityType: "REPUTABLE",
    closesAtStrategy: "match_start",
    closesAtOffsetHours: 0,
    resolutionBufferHours: 3,
    edgeCases: {
      matchPostponed: "Mercato annullato se la partita non si gioca entro 48h.",
      playerNotPlaying: "Se il giocatore non scende in campo, il mercato si risolve NO.",
      dataUnavailable: "Risoluzione manuale entro 24h basata su fonti ufficiali.",
    },
    sportMarketKind: "PLAYER_ANYTIME_SCORER",
  },

  // ─── Tier 3: Tactical ────────────────────────────────────────

  {
    id: "football-first-goal-timing",
    name: "Fascia Primo Gol",
    category: "tactical",
    marketType: "TIME_TO_EVENT",
    outcomes: [
      { key: "first_15", label: "0-15 minuti" },
      { key: "16_30", label: "16-30 minuti" },
      { key: "31_45", label: "31-45 minuti" },
      { key: "46_60", label: "46-60 minuti" },
      { key: "61_75", label: "61-75 minuti" },
      { key: "76_90", label: "76-90+ minuti" },
      { key: "no_goal", label: "Nessun gol" },
    ],
    resolutionCriteriaFull: "Minuto del primo gol della partita. Se nessun gol => no_goal. Se gol al 45+2 => 31_45. Supplementari esclusi.",
    resolutionAuthorityHost: "v3.football.api-sports.io",
    resolutionAuthorityType: "REPUTABLE",
    closesAtStrategy: "match_start",
    closesAtOffsetHours: 0,
    resolutionBufferHours: 3,
    edgeCases: {
      matchPostponed: "Mercato annullato se la partita non si gioca entro 48h.",
      dataUnavailable: "Risoluzione manuale entro 24h.",
    },
    sportMarketKind: "FIRST_GOAL_TIMING",
  },

  {
    id: "football-total-cards",
    name: "Cartellini Totali",
    category: "tactical",
    marketType: "RANGE",
    outcomes: [
      { key: "cards_0_2", label: "0-2 cartellini" },
      { key: "cards_3_4", label: "3-4 cartellini" },
      { key: "cards_5_6", label: "5-6 cartellini" },
      { key: "cards_7_plus", label: "7+ cartellini" },
    ],
    resolutionCriteriaFull: "Somma di tutti i cartellini (gialli + rossi) mostrati nei 90 minuti. Doppio giallo conta come 1 giallo + 1 rosso = 2 cartellini.",
    resolutionAuthorityHost: "v3.football.api-sports.io",
    resolutionAuthorityType: "REPUTABLE",
    closesAtStrategy: "match_start",
    closesAtOffsetHours: 0,
    resolutionBufferHours: 4,
    edgeCases: {
      matchPostponed: "Mercato annullato se la partita non si gioca entro 48h.",
      dataUnavailable: "Risoluzione manuale entro 48h.",
    },
    sportMarketKind: "TOTAL_CARDS_RANGE",
  },

  // ─── Tier 4: Narrative & Drama ────────────────────────────────

  {
    id: "football-halftime-state",
    name: "Stato All'Intervallo",
    category: "match_core",
    marketType: "MULTIPLE_CHOICE",
    outcomes: [
      { key: "ht_home_lead", label: "Casa in vantaggio" },
      { key: "ht_level", label: "Parità" },
      { key: "ht_away_lead", label: "Ospite in vantaggio" },
    ],
    resolutionCriteriaFull: "Score al termine del primo tempo. home > away => ht_home_lead; home = away => ht_level; home < away => ht_away_lead.",
    resolutionAuthorityHost: "api.football-data.org",
    resolutionAuthorityType: "REPUTABLE",
    closesAtStrategy: "match_start",
    closesAtOffsetHours: 0,
    resolutionBufferHours: 3,
    edgeCases: {
      matchPostponed: "Mercato annullato se la partita non si gioca entro 48h.",
      dataUnavailable: "Risoluzione manuale entro 24h.",
    },
    sportMarketKind: "HALF_TIME_STATE_3WAY",
  },

  {
    id: "football-comeback",
    name: "Ribaltone",
    category: "narrative_drama",
    marketType: "BINARY",
    resolutionCriteriaYes: "La squadra in vantaggio all'intervallo NON coincide con la vincente a fine gara (chi era avanti perde). Se pareggio all'intervallo, il mercato si risolve NO.",
    resolutionCriteriaNo: "Non c'è ribaltone: la squadra in vantaggio all'intervallo vince o pareggia, oppure era già pareggio all'intervallo.",
    resolutionAuthorityHost: "api.football-data.org",
    resolutionAuthorityType: "REPUTABLE",
    closesAtStrategy: "match_start",
    closesAtOffsetHours: 0,
    resolutionBufferHours: 3,
    edgeCases: {
      matchPostponed: "Mercato annullato se la partita non si gioca entro 48h.",
      dataUnavailable: "Risoluzione manuale entro 24h.",
    },
    sportMarketKind: "COMEBACK_SWAP_LEADER",
  },

  {
    id: "football-clean-sheet",
    name: "Clean Sheet",
    category: "match_core",
    marketType: "BINARY",
    resolutionCriteriaYes: "Almeno una squadra non subisce gol nei 90 minuti regolamentari.",
    resolutionCriteriaNo: "Entrambe le squadre subiscono almeno 1 gol.",
    resolutionAuthorityHost: "api.football-data.org",
    resolutionAuthorityType: "REPUTABLE",
    closesAtStrategy: "match_start",
    closesAtOffsetHours: 0,
    resolutionBufferHours: 3,
    edgeCases: {
      matchPostponed: "Mercato annullato se la partita non si gioca entro 48h.",
      dataUnavailable: "Risoluzione manuale entro 24h.",
    },
    sportMarketKind: "CLEAN_SHEET_ANY",
  },

  // ─── Off-field / Season ──────────────────────────────────────

  {
    id: "football-coach-sacking",
    name: "Esonero Allenatore",
    category: "off_field",
    marketType: "BINARY",
    resolutionCriteriaYes: "L'esonero viene annunciato ufficialmente dal club entro la scadenza del mercato.",
    resolutionCriteriaNo: "Nessun annuncio ufficiale di esonero entro la scadenza.",
    resolutionAuthorityHost: "google.com/news",
    resolutionAuthorityType: "REPUTABLE",
    closesAtStrategy: "custom_hours",
    resolutionBufferHours: 24,
    edgeCases: {
      matchPostponed: "Non applicabile (non legato a una singola partita).",
      dataUnavailable: "Risoluzione manuale: 3+ fonti Tier 1-2 concordi equivalgono a conferma.",
    },
    sportMarketKind: "COACH_SACKING",
  },

  {
    id: "football-transfer",
    name: "Trasferimento Ufficiale",
    category: "off_field",
    marketType: "BINARY",
    resolutionCriteriaYes: "Il trasferimento viene annunciato ufficialmente da almeno uno dei club coinvolti entro la scadenza.",
    resolutionCriteriaNo: "Nessun annuncio ufficiale entro la scadenza.",
    resolutionAuthorityHost: "google.com/news",
    resolutionAuthorityType: "REPUTABLE",
    closesAtStrategy: "custom_hours",
    resolutionBufferHours: 24,
    edgeCases: {
      matchPostponed: "Non applicabile.",
      dataUnavailable: "Risoluzione manuale: comunicato ufficiale del club come fonte primaria.",
    },
    sportMarketKind: "TRANSFER_OFFICIAL",
  },
];

export function getTemplateById(id: string): MarketTemplate | undefined {
  return MARKET_TEMPLATES.find((t) => t.id === id);
}

export function getTemplateByMarketKind(kind: string): MarketTemplate | undefined {
  return MARKET_TEMPLATES.find((t) => t.sportMarketKind === kind);
}

export function getTemplatesByCategory(category: string): MarketTemplate[] {
  return MARKET_TEMPLATES.filter((t) => t.category === category);
}
