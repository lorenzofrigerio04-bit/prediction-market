/**
 * Gate di pertinenza calcio per la news pipeline.
 * Obiettivo: solo contenuti sul football/soccer; escludere altri sport e topic generici
 * che possono arrivare da ingestione ampia o falsi positivi sul titolo.
 */

/** Lessico football-first (competizioni, termini tecnici, contesti tipici) */
const FOOTBALL_LEXICON: readonly string[] = [
  "calcio",
  "calciomercato",
  "serie a",
  "serie b",
  "serie c",
  "champions league",
  "champions",
  "uefa",
  "europa league",
  "conference league",
  "ucl",
  "premier league",
  "liga ",
  "la liga",
  "bundesliga",
  "ligue 1",
  "eredivisie",
  "primeira liga",
  "coppa italia",
  "supercoppa",
  "scudetto",
  "retrocessione",
  "salvezza",
  "girone",
  "rigore",
  "fuorigioco",
  "fuori gioco",
  "cartellino",
  "ammonizione",
  "espulsione",
  "corner",
  "pallonetto",
  "football",
  "soccer",
  "pallone",
  "partita",
  "matchday",
  "stadio",
  "tifos",
  "derby",
  "trasferimento",
  "agente fifa",
  "fair play finanziario",
  "nazionale",
  "azzurr",
  "mondiali",
  "europei",
  "qualificazioni",
  "allenatore",
  "mister ",
  " ct ",
  "portiere",
  "attaccante",
  "difensore",
  "centrocampista",
  "esterno",
  "punta",
  "trequartista",
  "mezzala",
  "assist ",
  " gol ",
  "gol/",
  "reti ",
  "rete ",
  "goal ",
  "assist:",
  "assist.",
  "assist-",
  "var ",
  " mercato ",
  "transfer",
  "loan ",
  "prestito secco",
];

/** Squadre / club / competizioni frequenti (riduce falsi negativi su titoli corti) */
const FOOTBALL_ENTITIES: readonly string[] = [
  "juventus",
  "inter ",
  "inter.",
  "inter,",
  " inter",
  "milan",
  "napoli",
  "as roma",
  "gialloross",
  "roma-lazio",
  "roma lazio",
  "lazio",
  "atalanta",
  "fiorentina",
  "torino",
  "bologna",
  "sassuolo",
  "udinese",
  "verona",
  "empoli",
  "lecce",
  "frosinone",
  "cagliari",
  "genoa",
  "como ",
  "parma",
  "venezia",
  "monza",
  "liverpool",
  "arsenal",
  "chelsea",
  "tottenham",
  "manchester city",
  "manchester united",
  "newcastle",
  "brighton",
  "fulham",
  "west ham",
  "real madrid",
  "barcelona",
  "barça",
  "barca",
  "atletico",
  "sevilla",
  "valencia",
  "bayern",
  "dortmund",
  "leverkusen",
  "psg",
  "paris saint",
  "monaco ",
  "messi",
  "ronaldo",
  "mbappé",
  "mbappe",
  "haaland",
  "vinicius",
  "osimhen",
  "lautaro",
  "vlahovic",
];

/**
 * Marcatori di altri sport / ambiti: se presenti serve un disambiguatore calcio
 * per non pubblicare basket, F1, tennis, ecc.
 */
const NON_FOOTBALL_PRIORITY: readonly RegExp[] = [
  /\bformula\s*1\b/i,
  /\bmoto\s*gp\b/i,
  /\bmotogp\b/i,
  /\bnb[aà]\b/i,
  /\bwimbledon\b/i,
  /\batp\b/i,
  /\bwta\b/i,
  /\bforo\s+italico\b/i,
  /\btennis\b/i,
  /\bolimpic[a-z]*\b/i,
  /\brugby\b/i,
  /\bvolley\b/i,
  /\bpallanuoto\b/i,
  /\bmma\b/i,
  /\bboxe\b/i,
  /\bciclismo\b/i,
  /\bgiro\s+d['’]italia\b/i,
  /\btour\s+de\s+france\b/i,
  /\bfis\b/i,
  /\bsci\s+(?:alpino|di\s+fondo)\b/i,
];

/** Termini che chiariscono che si parla di football anche se compaiono marcatori ambigui */
const FOOTBALL_DISAMBIGUATORS: readonly string[] = [
  "calcio",
  "serie a",
  "serie b",
  "champions",
  "uefa",
  "calciomercato",
  "europa league",
  "conference league",
  "premier league",
  "bundesliga",
  "liga",
  "scudetto",
  "coppa italia",
  "partita",
  "rigore",
  "fuorigioco",
  "mondiali di calcio",
  "europeo di calcio",
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

function matchesLexicon(lower: string): boolean {
  for (const phrase of FOOTBALL_LEXICON) {
    if (lower.includes(phrase)) return true;
  }
  for (const phrase of FOOTBALL_ENTITIES) {
    if (lower.includes(phrase)) return true;
  }
  return false;
}

function hasNonFootballSportSignal(raw: string): boolean {
  return NON_FOOTBALL_PRIORITY.some((re) => re.test(raw));
}

function hasFootballDisambiguator(lower: string): boolean {
  return FOOTBALL_DISAMBIGUATORS.some((d) => lower.includes(d));
}

/** Mercato finanziario vs calciomercato */
function isFinancialMercato(lower: string): boolean {
  if (lower.includes("calciomercato")) return false;
  if (
    /\bmercat(?:o|i)\s+(?:finanz|azioni|borse|obbligazioni|titoli)\b/i.test(lower)
  ) {
    return true;
  }
  return /\bmercati\s+azionar/i.test(lower);
}

/**
 * Restituisce true solo se il testo (titolo + estratto corpo) è pertinentemente sul calcio.
 */
export function passesFootballNewsFilter(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < 8) return false;

  const lower = normalize(trimmed);

  if (isFinancialMercato(lower)) return false;

  if (!matchesLexicon(lower)) return false;

  if (hasNonFootballSportSignal(trimmed)) {
    return hasFootballDisambiguator(lower);
  }

  return true;
}
