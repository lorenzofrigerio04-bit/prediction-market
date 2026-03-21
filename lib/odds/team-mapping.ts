/**
 * Mappatura nomi squadre italiano → The Odds API.
 * L'API usa nomi standard (es. "Juventus", "Napoli", "Inter").
 * Gli alias permettono di matchare "Juve", "La Juve", "Il Milan", ecc.
 */

/** Alias italiani comuni → nome canonico Odds API */
export const TEAM_ALIASES: Record<string, string> = {
  // Serie A - squadre principali
  juve: "Juventus",
  juventus: "Juventus",
  "la juve": "Juventus",

  milan: "AC Milan",
  "ac milan": "AC Milan",
  "il milan": "AC Milan",

  inter: "Inter",
  "l'inter": "Inter",
  "inter milan": "Inter",

  napoli: "Napoli",
  "il napoli": "Napoli",

  roma: "Roma",
  "la roma": "Roma",

  lazio: "Lazio",
  "la lazio": "Lazio",

  torino: "Torino",
  "il torino": "Torino",

  bologna: "Bologna",
  "il bologna": "Bologna",

  fiorentina: "Fiorentina",
  "la fiorentina": "Fiorentina",

  atalanta: "Atalanta",
  "l'atalanta": "Atalanta",

  genoa: "Genoa",
  "il genoa": "Genoa",

  cagliari: "Cagliari",
  "il cagliari": "Cagliari",

  udinese: "Udinese",
  "l'udinese": "Udinese",

  sassuolo: "Sassuolo",
  "il sassuolo": "Sassuolo",

  empoli: "Empoli",
  "l'empoli": "Empoli",

  monza: "Monza",
  "il monza": "Monza",

  verona: "Hellas Verona",
  "hellas verona": "Hellas Verona",

  lecce: "Lecce",
  "il lecce": "Lecce",

  como: "Como",
  "il como": "Como",

  venezia: "Venezia",
  "il venezia": "Venezia",

  palermo: "Palermo",
  "il palermo": "Palermo",

  parma: "Parma",
  "il parma": "Parma",

  cremonese: "Cremonese",
  "la cremonese": "Cremonese",

  spezia: "Spezia",
  "lo spezia": "Spezia",

  salernitana: "Salernitana",
  "la salernitana": "Salernitana",

  frosinone: "Frosinone",
  "il frosinone": "Frosinone",

  // Champions / Europa - squadre europee comuni
  "real madrid": "Real Madrid",
  "barcelona": "Barcelona",
  "bayern": "Bayern Munich",
  "bayern munich": "Bayern Munich",
  "manchester city": "Manchester City",
  "man city": "Manchester City",
  "manchester united": "Manchester United",
  "man united": "Manchester United",
  "liverpool": "Liverpool",
  "chelsea": "Chelsea",
  "arsenal": "Arsenal",
  "psg": "Paris Saint-Germain",
  "paris saint-germain": "Paris Saint-Germain",
  "parigi": "Paris Saint-Germain",
  "dortmund": "Borussia Dortmund",
  "borussia dortmund": "Borussia Dortmund",
  "ajax": "Ajax",
  "benfica": "Benfica",
  "porto": "Porto",
  "atletico madrid": "Atletico Madrid",
  "atletico": "Atletico Madrid",
  "sevilla": "Sevilla",
  "villareal": "Villarreal",
  "villarreal": "Villarreal",
};

/** Normalizza una stringa per il matching (lowercase, trim, rimuovi articoli) */
export function normalizeTeamName(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/^(il |la |lo |l'|un |una )/i, "")
    .replace(/\s+/g, " ");
}

/**
 * Risolvi un nome squadra (italiano o variante) al nome canonico Odds API.
 * Ritorna undefined se non trovato.
 */
export function resolveTeamName(input: string): string | undefined {
  const normalized = normalizeTeamName(input);
  if (!normalized) return undefined;

  // Match esatto negli alias
  const direct = TEAM_ALIASES[normalized];
  if (direct) return direct;

  // Match per contiene (es. "juventus" in "la juventus vincerà")
  for (const [alias, canonical] of Object.entries(TEAM_ALIASES)) {
    if (normalized.includes(alias) || alias.includes(normalized)) {
      return canonical;
    }
  }

  // Se il nome è già canonico (es. "Napoli"), prova a matchare
  const capitalized = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  const values = new Set(Object.values(TEAM_ALIASES));
  if (values.has(capitalized)) return capitalized;

  return undefined;
}

/**
 * Verifica se un nome nostro corrisponde al nome API (es. "Juve" → "Juventus").
 */
export function teamMatchesOurs(ourName: string, apiName: string): boolean {
  const resolved = resolveTeamName(ourName);
  if (!resolved) return ourName.toLowerCase().trim() === apiName.toLowerCase();
  return resolved.toLowerCase() === apiName.toLowerCase();
}

/**
 * Verifica se due nomi squadra corrispondono (considerando alias e ordine).
 */
export function teamsMatch(
  nameA: string,
  nameB: string,
  apiHome: string,
  apiAway: string
): boolean {
  const resolvedA = resolveTeamName(nameA) ?? nameA.trim();
  const resolvedB = resolveTeamName(nameB) ?? nameB.trim();

  const ourPair = [resolvedA.toLowerCase(), resolvedB.toLowerCase()].sort().join("|");
  const apiPair = [apiHome.toLowerCase(), apiAway.toLowerCase()].sort().join("|");

  return ourPair === apiPair;
}
