/**
 * Parser per titoli partite (es. "Inter vs Juventus", "Real Madrid - Barcellona").
 * Usato in sezione Sport/Calcio per box evento e etichette scommesse.
 */

export interface SportMatchTeams {
  teamA: string;
  teamB: string;
}

const VS_PATTERNS = [
  /\s+vs\.?\s+/i,
  /\s+-\s+/,
];

/**
 * Estrae le due squadre dal titolo se è in formato "X vs Y" o "X - Y".
 * Restituisce null se il titolo non matcha.
 */
export function parseSportMatchTitle(title: string): SportMatchTeams | null {
  let t = title.trim();
  if (!t) return null;
  /* "Chi vincerà Inter vs Juventus?" → estrae Inter / Juventus */
  t = t.replace(/^\s*chi\s+vincerà\s+/i, "").replace(/\?\s*$/, "").trim();
  if (!t) return null;
  for (const re of VS_PATTERNS) {
    const parts = t.split(re);
    if (parts.length === 2) {
      const teamA = parts[0]!.trim();
      const teamB = parts[1]!.trim();
      if (teamA && teamB) return { teamA, teamB };
    }
  }
  return null;
}

/**
 * Restituisce true se la categoria è Calcio (o Sport) e il titolo è una partita X vs Y.
 */
export function isSportMatchEvent(category: string, title: string): boolean {
  if (category !== "Calcio" && category !== "Sport") return false;
  return parseSportMatchTitle(title) !== null;
}

/**
 * Formatta il titolo per eventi binari partita: "X vs Y" → "Chi vincerà X vs Y?"
 */
export function formatBinaryMatchTitle(teams: SportMatchTeams): string {
  return `Chi vincerà ${teams.teamA} vs ${teams.teamB}?`;
}
