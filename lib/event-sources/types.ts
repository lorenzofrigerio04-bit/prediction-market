/**
 * Candidato da fonte notizie/eventi (NewsAPI, API-Football, ecc.).
 * Usato da pipeline home (news) e sport (fixture).
 */
export interface NewsCandidate {
  title: string;
  snippet: string;
  url: string;
  sourceName?: string;
  publishedAt: string;
  rawCategory?: string;
  /** Nome competizione per UI (es. "Serie A", "Champions League") */
  leagueName?: string;
  /** ID partita football-data.org per risoluzione automatica e stato live */
  footballDataMatchId?: number;
}
